import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class LiveWebSocketsConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()
   

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        chess_event = text_data_json['chess_event']

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'live_ws_chess_event',
                'chess_event':chess_event
            }
        )

    def live_ws_chess_event(self, event):
        chess_event = event['chess_event']

        self.send(text_data=json.dumps({
            'type':'live_ws',
            'chess_event':chess_event
        }))