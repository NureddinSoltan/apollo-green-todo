from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that extracts tokens from cookies instead of headers.

    This provides better security by preventing XSS attacks from accessing
    the token through JavaScript.
    """

    def authenticate(self, request):
        """
        Authenticate user using JWT token from cookies.

        Args:
            request: The HTTP request object

        Returns:
            tuple: (user, token) if authentication successful, None otherwise

        Raises:
            AuthenticationFailed: If token validation or user retrieval fails
        """
        token = request.COOKIES.get("access_token")

        if not token:
            return None
        try:
            validated_token = self.get_validated_token(token)
        except AuthenticationFailed as e:
            raise AuthenticationFailed(f"Token validation failed:{str(e)}")
        try:
            user = self.get_user(validated_token)
            return user, validated_token
        except AuthenticationFailed as e:
            raise AuthenticationFailed(f"Error retrieving user: {str(e)}")
