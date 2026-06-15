from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AccessibilityIssue

# Encodes user identity parameters and system authorization roles directly into JWT payload
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.profile.role
        token['username'] = user.username
        return token

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user_role = validated_data.pop('role', 'CITIZEN')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        user.profile.role = user_role
        user.profile.save()
        return user

class AccessibilityIssueSerializer(serializers.ModelSerializer):
    # Overriding field to securely fetch actual confirmation count from DB records dynamically
    community_votes = serializers.SerializerMethodField()

    class Meta:
        model = AccessibilityIssue
        fields = [
            'id', 'reported_by', 'latitude', 'longitude', 'description', 
            'category', 'image_before', 'image_after', 'status', 
            'community_votes', 'ai_severity_score', 'ai_category_tag', 'created_at'
        ]
        read_only_fields = ['id', 'ai_severity_score', 'ai_category_tag', 'created_at']

    def get_community_votes(self, obj):
        return obj.issue_votes.filter(vote_type='CONFIRM').count()