DO $$
DECLARE
  cat RECORD;
  demo JSONB := '{
    "playstation":[
      {"name":"PlayStation 5 Slim Digital","price":89000,"old":95000,"desc":"Console PS5 Slim édition digitale, 1To SSD."},
      {"name":"DualSense Wireless Midnight Black","price":11500,"old":13000,"desc":"Manette sans-fil PS5 avec retour haptique."},
      {"name":"PlayStation VR2 Headset","price":78000,"old":null,"desc":"Casque VR2 PlayStation, immersion 4K HDR."},
      {"name":"Pulse 3D Headset Wireless","price":18500,"old":21000,"desc":"Casque audio sans-fil officiel PS5."}
    ],
    "xbox":[
      {"name":"Xbox Series X 1To","price":92000,"old":98000,"desc":"Console next-gen 4K 120fps."},
      {"name":"Xbox Series S 512Go","price":52000,"old":null,"desc":"Console compacte tout digital."},
      {"name":"Manette Xbox Elite Series 2","price":24500,"old":27000,"desc":"Manette pro sans-fil personnalisable."},
      {"name":"Xbox Wireless Controller Robot White","price":9800,"old":null,"desc":"Manette officielle Xbox nouvelle génération."}
    ],
    "nintendo":[
      {"name":"Nintendo Switch OLED Néon","price":45000,"old":49000,"desc":"Écran OLED 7 pouces, Joy-Con néon."},
      {"name":"Switch Lite Turquoise","price":29500,"old":null,"desc":"Console portable ultra-légère."},
      {"name":"Pro Controller Nintendo Switch","price":12500,"old":14000,"desc":"Manette pro sans-fil officielle."},
      {"name":"Zelda Tears of the Kingdom","price":8500,"old":null,"desc":"Jeu Switch, aventure épique."}
    ],
    "vr":[
      {"name":"Meta Quest 3 128Go","price":78000,"old":85000,"desc":"Casque VR autonome nouvelle génération."},
      {"name":"Meta Quest 3S","price":58000,"old":null,"desc":"Version compacte, immersion Mixed Reality."},
      {"name":"PICO 4 All-in-One VR","price":62000,"old":68000,"desc":"Casque VR 4K sans fil."},
      {"name":"Sangle Elite Quest 3","price":6500,"old":null,"desc":"Sangle confort premium pour Quest 3."}
    ],
    "consoles-retro":[
      {"name":"Sega Mega Drive Mini 2","price":19500,"old":22000,"desc":"Console rétro 60 jeux préinstallés."},
      {"name":"Super Nintendo Classic Edition","price":22500,"old":null,"desc":"Console mini avec 21 classiques."},
      {"name":"Analogue Pocket Édition Noire","price":42000,"old":null,"desc":"Console portable rétro FPGA."},
      {"name":"Atari 2600 Plus","price":18000,"old":20000,"desc":"Rééedition officielle 2600."}
    ],
    "manettes":[
      {"name":"Manette DualSense Edge","price":35000,"old":38000,"desc":"Manette pro PS5 modulable."},
      {"name":"Razer Wolverine V2 Xbox","price":22500,"old":null,"desc":"Manette e-sport filaire."},
      {"name":"8BitDo Ultimate Bluetooth","price":9500,"old":11000,"desc":"Manette pro compatible Switch/PC."},
      {"name":"SCUF Reflex Pro","price":42000,"old":null,"desc":"Manette PS5 personnalisée e-sport."}
    ],
    "jeux":[
      {"name":"EA Sports FC 25 PS5","price":9500,"old":11000,"desc":"Simulation football nouvelle génération."},
      {"name":"Call of Duty Black Ops 6","price":11500,"old":null,"desc":"FPS multijoueur Activision."},
      {"name":"Assassin Creed Shadows","price":10500,"old":12000,"desc":"Ubisoft, aventure au Japon féodal."},
      {"name":"GTA VI Standard Edition","price":13500,"old":null,"desc":"Rockstar Games, monde ouvert."}
    ],
    "volants":[
      {"name":"Logitech G29 Racing Wheel","price":48000,"old":54000,"desc":"Volant à retour de force PS/PC."},
      {"name":"Thrustmaster T300RS GT","price":72000,"old":null,"desc":"Volant pro simracing PS5."},
      {"name":"Fanatec CSL DD 5Nm","price":89000,"old":95000,"desc":"Base direct drive haut de gamme."},
      {"name":"Playseat Challenge Cockpit","price":38000,"old":null,"desc":"Cockpit pliable simracing."}
    ],
    "casques":[
      {"name":"SteelSeries Arctis Nova Pro","price":42000,"old":47000,"desc":"Casque gaming Hi-Fi wireless."},
      {"name":"Razer Kraken V4 Pro","price":38000,"old":null,"desc":"Audio 3D immersif THX."},
      {"name":"HyperX Cloud III Wireless","price":18500,"old":21000,"desc":"Autonomie 120h."},
      {"name":"Astro A50 X Gen 5","price":58000,"old":null,"desc":"Casque premium multiplateforme."}
    ],
    "accessoires":[
      {"name":"Station de charge DualSense","price":4500,"old":5500,"desc":"Dock chargeur double manette PS5."},
      {"name":"Verre trempé Switch OLED","price":1200,"old":null,"desc":"Protection écran haute clarté."},
      {"name":"Sacoche transport PS5","price":6500,"old":7500,"desc":"Sacoche rembourrée officielle."},
      {"name":"Adaptateur Bluetooth 8BitDo","price":3500,"old":null,"desc":"Compatible Switch/PC/Mac."}
    ]
  }'::jsonb;
  item JSONB;
  slug_base TEXT;
  final_slug TEXT;
  counter INT;
BEGIN
  FOR cat IN SELECT id, slug FROM public.categories LOOP
    IF EXISTS (SELECT 1 FROM public.products WHERE category_id = cat.id) THEN
      CONTINUE;
    END IF;
    IF NOT (demo ? cat.slug) THEN
      CONTINUE;
    END IF;
    FOR item IN SELECT * FROM jsonb_array_elements(demo -> cat.slug) LOOP
      slug_base := regexp_replace(lower(item->>'name'), '[^a-z0-9]+', '-', 'g');
      slug_base := trim(both '-' from slug_base);
      final_slug := slug_base;
      counter := 1;
      WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := slug_base || '-' || counter;
      END LOOP;
      INSERT INTO public.products (
        slug, name_fr, description_fr, price_da, compare_at_price_da,
        stock, featured, active, category_id, is_new
      ) VALUES (
        final_slug,
        item->>'name',
        item->>'desc',
        (item->>'price')::numeric,
        CASE WHEN item->>'old' IS NULL OR item->>'old' = 'null' THEN NULL ELSE (item->>'old')::numeric END,
        10,
        true,
        true,
        cat.id,
        true
      );
    END LOOP;
  END LOOP;
END $$;