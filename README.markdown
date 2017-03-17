# Django Rest Table

- ***this table only implemeted comunication by  method GET***


## This Table is create in vanilla javascript, no required dependencies

### Dependence Optional
- css Bootstrap 3 or 4

### Setup
- minimun config in `settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'api.custom.PaginationDjangoRestTable',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
}
```

### Custom Pagination.py
```python
import django_filters
from rest_framework.response import Response
from rest_framework import pagination

class PaginationDjangoRestTable(pagination.LimitOffsetPagination):

    final = 0

    def get_current(self):
        def _divide_with_ceil(a, b):
            '''
            Returns 'a' divided by 'b', with any remainder rounded up.
            '''
            if a % b:
                return (a // b) + 1
            return a // b
        final = None
        base_url = self.request.build_absolute_uri()
        if self.limit:
            current = _divide_with_ceil(self.offset, self.limit) + 1
            # The number of pages is a little bit fiddly.
            # We need to sum both the number of pages from current offset to end
            # plus the number of pages up to the current offset.
            # When offset is not strictly divisible by the limit then we may
            # end up introducing an extra page as an artifact.
            final = (
                _divide_with_ceil(self.count - self.offset, self.limit) +
                _divide_with_ceil(self.offset, self.limit)
            )

            if final < 1:
                final = 1
        else:
            current = 1
            final = 1

        if current > final:
            current = final

        self.final = final

        return current

    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.count,
            'limit' : self.get_limit(self.request),
            'current' : self.get_current(),
            'final' : self.final,
            'results': data
        })
```

### Example Class ApiView

```python
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
```

### Create Table

```javascript
var resource_api = <url-resource>
new djangoRestTable('<name-id-tag-content-table>',resource_api,{
  'id' : {
    'name' : 'ID',
  },
  'name' : {
    'name' : 'Nombre'
  },
  'description' : {
    'name' : 'Descripcion'
  },
  'dog_breed' : {
    'name' : 'Raza'
  },
},{
  'class_table' : 'table table-striped table-hover',
  'max' : 4,
  'min' : 10,
});
```
