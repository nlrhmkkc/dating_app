import random
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Person, Message

# ---------------------------------------------------------------------------
# Auto responses betöltése JSON-ból
# ---------------------------------------------------------------------------
_AUTO_RESPONSES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'auto_responses.json')

try:
    with open(_AUTO_RESPONSES_PATH, encoding='utf-8') as f:
        _AUTO_RESPONSES = json.load(f)
except Exception:
    _AUTO_RESPONSES = [f"Automatikus válasz #{i+1}" for i in range(100)]


# ---------------------------------------------------------------------------
# GET /api/people/
# ---------------------------------------------------------------------------
def people_list(request):
    people = Person.objects.all().values('id', 'name', 'age', 'description', 'image_path')
    result = [
        {
            'id': p['id'],
            'name': p['name'],
            'age': p['age'],
            'description': p['description'],
            'imagePath': p['image_path'],
        }
        for p in people
    ]
    return JsonResponse(result, safe=False)


# ---------------------------------------------------------------------------
# GET /api/auto-responses/
# ---------------------------------------------------------------------------
def auto_responses(request):
    return JsonResponse(_AUTO_RESPONSES, safe=False)


# ---------------------------------------------------------------------------
# GET  /api/messages/<conversation>/
# POST /api/messages/<conversation>/
# ---------------------------------------------------------------------------
@csrf_exempt
@require_http_methods(['GET', 'POST'])
def messages(request, conversation: str):
    if request.method == 'GET':
        msgs = Message.objects.filter(conversation=conversation)
        result = [
            {
                'type': m.msg_type,
                'content': m.content,
                'from': m.from_who,
                'avatar': m.avatar,
            }
            for m in msgs
        ]
        return JsonResponse(result, safe=False)

    # POST
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    msg_type = body.get('type', 'text')
    content = body.get('content', '')
    from_who = body.get('from', 'me')
    avatar = body.get('avatar', None)

    if not content:
        return JsonResponse({'error': 'content required'}, status=400)

    Message.objects.create(
        conversation=conversation,
        msg_type=msg_type,
        content=content,
        from_who=from_who,
        avatar=avatar,
    )

    auto_reply = None
    if from_who == 'me':
        reply_text = random.choice(_AUTO_RESPONSES)
        them_avatar = body.get('themAvatar', None)
        reply = Message.objects.create(
            conversation=conversation,
            msg_type='text',
            content=reply_text,
            from_who='them',
            avatar=them_avatar,
        )
        auto_reply = {
            'type': reply.msg_type,
            'content': reply.content,
            'from': reply.from_who,
            'avatar': reply.avatar,
        }

    return JsonResponse({'saved': True, 'autoReply': auto_reply}, status=201)