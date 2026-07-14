from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Merchant
from .serializers import RegistrationSerializer, MerchantProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = Merchant.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Merchant account created successfully."
            },
            status=status.HTTP_201_CREATED
        )
    
class MerchantProfileView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MerchantProfileSerializer

    def get_object(self):
        return self.request.user

# Create your views here.
