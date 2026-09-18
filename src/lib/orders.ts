import { queryOptions } from "@tanstack/react-query";
import { getOrderById } from "@/lib/orders.functions";

export type Order = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string | null;
  subtotal_da: number;
  total_da: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  unit_price_da: number;
  quantity: number;
  line_total_da: number;
};

export const orderByIdQO = (id: string) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: async (): Promise<{ order: Order; items: OrderItem[] } | null> => {
      const result = (await getOrderById({ data: { id } })) as
        | { order: Order; items: OrderItem[] }
        | null;
      if (!result) return null;
      return {
        order: result.order,
        items: result.items ?? [],
      };
    },
  });

export const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
  "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès",
  "In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa",
  "Aflou","Barika","Bir El Ater","El Abiodh Sidi Cheikh","El Aricha","El Kantara",
  "Ksar Chellala","Messaad","Aïn Oussera","Frenda","Bou Saâda",
];