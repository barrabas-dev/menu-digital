from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # Obtenemos el token estándar
        token = super().get_token(user)

        # Inyectamos los claims directamente desde el registro en Supabase
        token['user_id'] = user.id
        
        # Asumiendo que definiste un rol en tu modelo o perfil
        token['rol'] = getattr(user, 'rol', 'restaurant') 

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Estructuramos la respuesta JSON que recibirá React
        data['user'] = {
            'id': self.user.id,
            'rol': getattr(self.user, 'rol', 'restaurant'),
        }
        return data