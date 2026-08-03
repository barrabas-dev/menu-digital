from django.http import JsonResponse

def test_endpoint(request):
    """
    Un endpoint de prueba básico para verificar que React puede 
    comunicarse con Django mediante HTTP.
    """
    return JsonResponse({
        "message": "¡Hola, React! Este mensaje de prueba viene desde el backend en Django."
    })
