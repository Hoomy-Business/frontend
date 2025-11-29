#!/bin/bash

# Script pour tester l'authentification backend

echo "🧪 Test de l'authentification backend"
echo "======================================"

BACKEND_URL="https://backend.hoomy.site"

echo ""
echo "1️⃣ Test de la route publique (sans auth)..."
curl -s "$BACKEND_URL/api/locations/cantons" | head -c 100
echo ""
echo ""

echo "2️⃣ Test de la route de profil (sans token - devrait retourner 401)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/profile")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "Code HTTP: $HTTP_CODE"
echo "Réponse: $BODY"
echo ""

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Backend répond correctement (401 attendu sans token)"
else
    echo "⚠️  Code HTTP inattendu: $HTTP_CODE"
fi

echo ""
echo "3️⃣ Test de la route de login (sans credentials - devrait retourner 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "Code HTTP: $HTTP_CODE"
echo "Réponse: $BODY"
echo ""

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Backend répond correctement"
else
    echo "⚠️  Code HTTP inattendu: $HTTP_CODE"
fi

echo ""
echo "4️⃣ Vérification de la configuration CORS..."
RESPONSE=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/auth/profile" \
    -H "Origin: https://hoomy.site" \
    -H "Access-Control-Request-Method: GET")
    
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS configuré"
    echo "$RESPONSE" | grep -i "access-control"
else
    echo "⚠️  CORS peut ne pas être configuré correctement"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "✅ Tests terminés"
echo ""
echo "Si tous les tests passent, le backend fonctionne correctement."
echo "Le problème 'Session expirée' vient probablement du frontend."
echo "════════════════════════════════════════════════"


