from rest_framework import serializers
from users.models import CustomUser

from ..models import RemoteGameLog

class CreateRemoteGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemoteGameLog
        fields = [
            "winner",
            "loser",
            "winner_score",
            "loser_score",
        ]

    def validate(self, data):
        winner = data.get("winner")
        loser = data.get("loser")

        if not winner or not loser:
            raise serializers.ValidationError("Both winnerID and loserID are required.")

        if winner == loser:
            raise serializers.ValidationError(
                "Winner and loser cannot be the same user."
            )

        if not CustomUser.objects.filter(id=winner.id).exists():
            raise serializers.ValidationError(
                f"Winner with ID {winner} does not exist."
            )

        if not CustomUser.objects.filter(id=loser.id).exists():
            raise serializers.ValidationError(f"Loser with ID {loser} does not exist.")

        if data.get("winner_score") <= data.get("loser_score"):
            raise serializers.ValidationError(
                "Winner score should be higher than loser score."
            )

        return data

    def create(self, validated_data):
        remote_game = RemoteGameLog.objects.create(**validated_data)
        remote_game.users.set([validated_data["winner"], validated_data["loser"]])

        return remote_game


class RemoteGameSerializer(serializers.ModelSerializer):
    opponent_username = serializers.SerializerMethodField()
    my_score = serializers.SerializerMethodField()
    opponent_score = serializers.SerializerMethodField()
    is_win = serializers.SerializerMethodField()

    users = serializers.CharField(source="users.username", read_only=True)

    class Meta:
        model = RemoteGameLog
        fields = [
            "users",
            "date",
            "opponent_username",
            "my_score",
            "opponent_score",
            "is_win",
        ]

    def _get_user(self):
        """Helper to get the user making the request."""
        user_id = self.context.get("user_id")
        if not user_id:
            return None
        return CustomUser.objects.filter(id=user_id).first()

    def get_my_score(self, obj):
        """Return the score of the user making the request."""
        user = self._get_user()
        if not user or user not in obj.users.all():
            return None
        return obj.get_my_score(user.username)

    def get_opponent_username(self, obj):
        """Determine the opponent dynamically."""
        user = self._get_user()
        if user and user in obj.users.all():
            opponents = obj.users.exclude(id=user.id)
            return opponents.first().username if opponents.exists() else "Deleted User"
        return None

    def get_opponent_score(self, obj):
        """Return the opponent's score."""
        user = self._get_user()
        if not user or user not in obj.users.all():
            return None
        return obj.get_opponent_score(user.username)

    def get_is_win(self, obj):
        """Return whether the user won the game."""
        user = self._get_user()
        if not user or user not in obj.users.all():
            return None
        return obj.is_win_for_user(user.username)
