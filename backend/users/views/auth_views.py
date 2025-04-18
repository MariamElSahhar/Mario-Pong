from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ..models import CustomUser
from ..utils import send_otp, set_response_cookie, update_user_activity
from ..serializers import LoginSerializer, OTPVerificationSerializer, UserSerializer


# LOGIN
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    # manually handle the no user found error here to avoid disclosing if user exists
    login_serializer = LoginSerializer(data=request.data)
    if login_serializer.is_valid():
        username = login_serializer.validated_data["username"]
        password = login_serializer.validated_data["password"]
        request.session["password"] = password

        user = CustomUser.objects.filter(username=username).first()
        if user and user.check_password(password):
            if user.is_superuser or not user.enable_otp:
                token_serializer = TokenObtainPairSerializer(
                    data={"username": user.username, "password": password}
                )
                if token_serializer.is_valid(raise_exception=True):
                    tokens = token_serializer.validated_data
                    response = Response(
                        {
                            "message": "Login Successful.",
                            "data": {
                                "username": user.username,
                                "user_id": user.id,
                                "user_email": user.email,
                                "otp": False,
                                "avatar": user.avatar.url if user.avatar else None,
                            },
                        },
                        status=status.HTTP_200_OK,
                    )
                return set_response_cookie(response, tokens, user, True)
            elif user.enable_otp:
                try:
                    send_otp(user)
                except Exception as e:
                    return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                return Response(
                    {
                        "message": "OTP sent to your email.",
                        "data": {"otp": True}
                    },
                    status=status.HTTP_200_OK
                )
        else:
            return Response(
                {"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        return Response(
            {"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )

# REGISTRATION
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    user_serializer = UserSerializer(data=request.data)

    if user_serializer.is_valid(raise_exception=True):
        # Save and handle successful registration
        password = user_serializer.validated_data["password"]
        request.session["password"] = password
        user = user_serializer.save(password=make_password(password))

        # Send OTP
        try:
            send_otp(user)
        except Exception as e:
            return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(
            {"message": "Registration successful. OTP has been sent to your email."},
            status=status.HTTP_201_CREATED,
        )


# OTP VERIFICATION
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp_view(request):
    serializer = OTPVerificationSerializer(data=request.data)
    # The serializer will validate OTP and expiration
    if serializer.is_valid(raise_exception=True):
        user = serializer.validated_data["user"]
        password = request.session.get("password")

        # Issue tokens here after successful OTP verification
        token_serializer = TokenObtainPairSerializer(
            data={"username": user.username, "password": password}
        )

        if token_serializer.is_valid(raise_exception=True):
            tokens = token_serializer.validated_data
            response = Response(
                {
                    "message": "OTP verified successfully. Login successful.",
                    "data": {
                        "username": user.username,
                        "user_id": user.id,
                        "user_email": user.email,
                        "otp": user.enable_otp,
                        "avatar": user.avatar.url if user.avatar else None,
                    },
                },
                status=status.HTTP_200_OK,
            )
            response = set_response_cookie(response, tokens, user, True)
            del request.session["password"]
            return response

# RETRIEVE SESSION
@api_view(["GET"])
def get_user_info_view(request):
    user = request.user
    response = Response(
                {
                    "data": {
                        "username": user.username,
                        "user_id": user.id,
                        "user_email": user.email,
                        "otp": user.enable_otp,
                        "avatar": user.avatar.url if user.avatar else None,
                    },
                },
                status=status.HTTP_200_OK,
            )
    return response

# LOGOUT
@api_view(["POST"])
def logout_view(request):
    response = Response(
        {"message": "Logout successful.",},
        status=status.HTTP_200_OK,
    )
    # remove both access and refresh tokens
    response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE"])
    response.delete_cookie("refresh_token")
    # update status to offline, save last seen to now
    update_user_activity(request.user, False)
    return response
