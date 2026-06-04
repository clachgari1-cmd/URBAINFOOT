<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Pitch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Client User
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name'     => 'Test Client',
                'password' => Hash::make('password'),
            ]
        );

        // Seed Brand Partners (Admins de Marque)
        $nike = Partner::updateOrCreate(
            ['email' => 'nike@example.com'],
            [
                'name'        => 'Nike',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'mark',
            ]
        );

        $adidas = Partner::updateOrCreate(
            ['email' => 'adidas@example.com'],
            [
                'name'        => 'Adidas',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'mark',
            ]
        );

        $puma = Partner::updateOrCreate(
            ['email' => 'puma@example.com'],
            [
                'name'        => 'Puma',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'mark',
            ]
        );

        $reusch = Partner::updateOrCreate(
            ['email' => 'reusch@example.com'],
            [
                'name'        => 'Reusch',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'mark',
            ]
        );

        $nb = Partner::updateOrCreate(
            ['email' => 'newbalance@example.com'],
            [
                'name'        => 'New Balance',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'mark',
            ]
        );

        // Seed products for each brand
        $productsData = [
            [
                'partner_id'  => $nike->id,
                'name'        => 'Nike Phantom GX Elite',
                'category'    => 'Chaussures',
                'price'       => 1890,
                'stock'       => 10,
                'image_path'  => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
                'description' => 'Chaussures de pointe pour terrain synthétique. Technologie Ghost Lace invisible.',
            ],
            [
                'partner_id'  => $adidas->id,
                'name'        => 'Adidas Predator Edge',
                'category'    => 'Chaussures',
                'price'       => 1490,
                'stock'       => 15,
                'image_path'  => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
                'description' => 'Tige texturée pour une précision maximale. Semelle SG adaptée aux terrains lourds.',
            ],
            [
                'partner_id'  => $adidas->id,
                'name'        => 'Ballon FIFA Pro UCL',
                'category'    => 'Ballons',
                'price'       => 590,
                'stock'       => 30,
                'image_path'  => 'https://images.unsplash.com/photo-1614632537239-e1258259c651?w=500&q=80',
                'description' => 'Ballon certifié FIFA Quality Pro. Utilisé dans les compétitions officelles.',
            ],
            [
                'partner_id'  => $nike->id,
                'name'        => 'Maillot Squad Pro 2026',
                'category'    => 'Maillots',
                'price'       => 790,
                'stock'       => 20,
                'image_path'  => 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=500&q=80',
                'description' => 'Maillot Dri-FIT léger et respirant. Personnalisable avec nom et numéro.',
            ],
            [
                'partner_id'  => $reusch->id,
                'name'        => 'Gants Reusch Attrakt',
                'category'    => 'Gardien',
                'price'       => 850,
                'stock'       => 12,
                'image_path'  => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80',
                'description' => 'Gants de gardien latex allemand, grip exceptionnel par tous les temps.',
            ],
            [
                'partner_id'  => $puma->id,
                'name'        => 'Puma King Premium',
                'category'    => 'Chaussures',
                'price'       => 990,
                'stock'       => 18,
                'image_path'  => 'https://images.unsplash.com/photo-1556906781-9a412961a28b?w=500&q=80',
                'description' => 'Chaussures en cuir véritable pour une touche de balle incomparable.',
            ],
            [
                'partner_id'  => $adidas->id,
                'name'        => 'Sac de Sport Adidas',
                'category'    => 'Accessoires',
                'price'       => 490,
                'stock'       => 25,
                'image_path'  => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
                'description' => 'Grande capacité 50L, compartiment chaussures séparé, bandoulière ajustable.',
            ],
            [
                'partner_id'  => $nike->id,
                'name'        => 'Protège-tibias Elite',
                'category'    => 'Accessoires',
                'price'       => 240,
                'stock'       => 40,
                'image_path'  => 'https://images.unsplash.com/photo-1589987607627-616cca389d44?w=500&q=80',
                'description' => 'Protection légère et anatomique, ultra-confort en match.',
            ],
            [
                'partner_id'  => $nb->id,
                'name'        => 'New Balance Furon v7',
                'category'    => 'Chaussures',
                'price'       => 1350,
                'stock'       => 8,
                'image_path'  => 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&q=80',
                'description' => 'Chaussures légères pour les milieux de terrain. Semelle FG polyvalente.',
            ],
        ];

        foreach ($productsData as $prod) {
            Product::updateOrCreate(
                ['name' => $prod['name']],
                $prod
            );
        }

        // Seed Terrain Managers
        $manager = Partner::updateOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name'        => 'Terrain Manager General',
                'password'    => Hash::make('password'),
                'access_code' => Hash::make('1234'),
                'type'        => 'terrain_manager',
            ]
        );

        // Seed Pitches
        $pitchesData = [
            [
                'partner_id'     => $manager->id,
                'name'           => 'Menzah Arena 5v5',
                'type'           => '5',
                'price_per_hour' => 120,
                'city'           => 'Casablanca – Maârif',
                'features'       => ['Vestiaires', 'Éclairage LED', 'Pelouse synth.', 'Parking'],
                'description'    => 'Terrain intérieur climatisé, idéal pour des matchs intenses entre amis.',
                'image_path'     => 'https://images.unsplash.com/photo-1510051640316-cee39563ddab?w=600&q=80',
            ],
            [
                'partner_id'     => $manager->id,
                'name'           => 'Atlas Seven Park',
                'type'           => '7',
                'price_per_hour' => 200,
                'city'           => 'Rabat – Agdal',
                'features'       => ['Vestiaires', 'Tribunes', 'Pelouse hybride', 'Café'],
                'description'    => 'Terrain à ciel ouvert avec tribunes et café à proximité.',
                'image_path'     => 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80',
            ],
            [
                'partner_id'     => $manager->id,
                'name'           => 'Grand Stade 11 Guéliz',
                'type'           => '11',
                'price_per_hour' => 350,
                'city'           => 'Marrakech – Guéliz',
                'features'       => ['Vestiaires VIP', 'Écran vidéo', 'Pelouse naturelle', 'VIP Parking'],
                'description'    => 'Stade de référence pour matchs officiels 11v11 à Marrakech.',
                'image_path'     => 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
            ],
            [
                'partner_id'     => $manager->id,
                'name'           => 'Urban Cage Casablanca',
                'type'           => '5',
                'price_per_hour' => 100,
                'city'           => 'Casablanca – Hay Hassani',
                'features'       => ['Vestiaires', 'Éclairage LED', 'Cage murs'],
                'description'    => 'Terrain cage en intérieur, ambiance compétition garantie.',
                'image_path'     => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
            ],
            [
                'partner_id'     => $manager->id,
                'name'           => 'Parc des Champions 7',
                'type'           => '7',
                'price_per_hour' => 220,
                'city'           => 'Fès – Ville Nouvelle',
                'features'       => ['Vestiaires', 'Gazon naturel', 'Vue panoramique', 'Café'],
                'description'    => 'Terrain en herbe naturelle entouré de verdure, vue sur les collines de Fès.',
                'image_path'     => 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=600&q=80',
            ],
            [
                'partner_id'     => $manager->id,
                'name'           => 'El Bernabéu Tanger',
                'type'           => '11',
                'price_per_hour' => 320,
                'city'           => 'Tanger – Zone Franche',
                'features'       => ['Vestiaires', 'Tribune 200pl.', 'Pelouse synth.', 'Buvette'],
                'description'    => 'Stade communautaire avec ambiance matchday chaque week-end à Tanger.',
                'image_path'     => 'https://images.unsplash.com/photo-1594729095022-e2f6d2eece9c?w=600&q=80',
            ],
        ];

        foreach ($pitchesData as $p) {
            Pitch::updateOrCreate(
                ['name' => $p['name']],
                $p
            );
        }
    }
}
