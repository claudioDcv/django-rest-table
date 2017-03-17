# create by claudio.dcv@gmail.com
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
