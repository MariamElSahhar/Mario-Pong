import pyotp
from django.core.mail import send_mail


def generate_otp():
    totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
    return totp.now()


def verify_otp(otp, user_otp):
    return otp == user_otp


def send_otp(user):
    """
    Utility function to generate and send OTP
    """

    otp = generate_otp()
    user.email_otp = otp
    user.save()
    send_mail(
        'Your Email OTP code', f'Your OTP for email verification is: {otp}',
        'admin@42ADtranscendence.ae',
        [user.email],
        fail_silently=False
    )
