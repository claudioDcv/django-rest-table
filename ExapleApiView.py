from patient.models import Patient
from rest_framework import generics, filters
import django_filters
from .serializers import PatientSerializer
from rest_framework.response import Response
from django.db.models import Q

# ViewSets define the view behavior.
class PatientAPIView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (filters.OrderingFilter, django_filters.rest_framework.DjangoFilterBackend,)
    filter_fields = ('id', 'name')
    ordering_fields = ('name', 'dog_breed','id','description')

    def get(self, request):
        recent_users = Patient.objects.all()

        if request.GET.get('search'):
            string = request.GET.get('search')
            recent_users = recent_users.filter(
                Q(id__icontains=string) |
                Q(name__icontains=string) |
                Q(dog_breed__name__icontains=string)
            )

        if request.GET.get('ordering'):
            string = request.GET.get('ordering')
            recent_users = recent_users.order_by(string)

        page = self.paginate_queryset(recent_users)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(recent_users, many=True)
        return Response(serializer.data)
