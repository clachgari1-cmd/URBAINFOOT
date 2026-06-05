#!/bin/bash
set -e

echo "=== Lancement des migrations Laravel ==="
php artisan migrate --force

echo "=== Lancement des seeders (Données de test) ==="
php artisan db:seed --force

echo "=== Nettoyage du cache ==="
php artisan config:clear
php artisan cache:clear

echo "=== Démarrage de l'application ==="
php artisan serve --host=0.0.0.0 --port=$PORT