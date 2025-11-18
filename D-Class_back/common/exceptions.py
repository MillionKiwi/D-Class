from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'detail': response.data.get('detail', 'An error occurred'),
        }
        
        # Add field errors if they exist
        if isinstance(response.data, dict):
            field_errors = {}
            for key, value in response.data.items():
                if key != 'detail' and isinstance(value, (list, dict)):
                    field_errors[key] = value
            
            if field_errors:
                custom_response_data['field_errors'] = field_errors
        
        response.data = custom_response_data
    
    return response

