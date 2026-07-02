# Приглашение для Дианы

Одностраничный сайт-приглашение: ночное небо со звёздами, светлячки, открывающийся конверт-письмо и вопрос с "убегающей" кнопкой "Нет".

Никакой сборки не требуется — чистые HTML/CSS/JS.

## Как выложить на GitHub Pages

1. Создай новый репозиторий на GitHub (например `diana-invite`), можно приватным или публичным.
2. В этой папке выполни:
   ```bash
   git remote add origin https://github.com/<твой-логин>/diana-invite.git
   git branch -M main
   git push -u origin main
   ```
3. В настройках репозитория: **Settings → Pages → Source** выбери ветку `main` и папку `/ (root)`.
4. Через минуту сайт будет доступен по адресу:
   `https://<твой-логин>.github.io/diana-invite/`

## Локальный просмотр

```bash
python3 -m http.server 8000
```
и открой `http://localhost:8000`.
