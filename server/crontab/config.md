Заполнение задач на уведомления
```
0 12 * * * wget cromberg.blweb.ru/notify?key=$KEY -O /dev/null
```

Отправка уведомлений
```
0 12,13,18,19 * * * wget cromberg.blweb.ru/send-notify -O /dev/null
```
