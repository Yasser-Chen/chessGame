from django.shortcuts import render
import uuid
import time

# Create your views here.

def lobby(request):
    return render   (request, 'game/index.html',
                        {
                            'MY_USER_ID'    : uuid.uuid4() ,
                            'prio'          : round(time.time() * 1000) ,
                        }
                    )