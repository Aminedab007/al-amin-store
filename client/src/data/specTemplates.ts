// src/data/specTemplates.ts
export type ProductSpec = { label: string; value: string };

const only = (arr: (ProductSpec | null | undefined)[]) =>
  arr.filter(Boolean) as ProductSpec[];

const s = (label: string, value?: string) =>
  value && value.trim().length ? ({ label, value: value.trim() } as ProductSpec) : null;

export type BaseSpecInput = {
  brand?: string;
  model?: string;
  sku?: string;
  warranty?: string; // ex: "1 an"
  color?: string;
  origin?: string; // ex: "Tunisie" / "Chine"
};

export const baseSpecs = (i: BaseSpecInput) =>
  only([
    s("Marque", i.brand),
    s("Modèle", i.model),
    s("Référence (SKU)", i.sku),
    s("Couleur", i.color),
    s("Origine", i.origin),
    s("Garantie", i.warranty),
  ]);

// -------------------------
// 📱 Smartphones & Mobile
// -------------------------
export type SmartphoneSpecInput = BaseSpecInput & {
  storage?: string; // "128 GB"
  ram?: string; // "6 GB"
  screen?: string; // "6.5\""
  resolution?: string; // "FHD+"
  chipset?: string;
  battery?: string; // "5000 mAh"
  camera?: string; // "50MP + 8MP..."
  os?: string; // Android/iOS
  network?: string; // 4G/5G
  sim?: string; // Dual SIM
  charging?: string; // "Fast charge 25W"
  connectivity?: string; // "Wi-Fi, BT, NFC"
};

export const smartphoneSpecs = (i: SmartphoneSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Stockage", i.storage),
    s("RAM", i.ram),
    s("Écran", i.screen),
    s("Résolution", i.resolution),
    s("Processeur", i.chipset),
    s("Batterie", i.battery),
    s("Caméra", i.camera),
    s("Système", i.os),
    s("Réseau", i.network),
    s("SIM", i.sim),
    s("Charge", i.charging),
    s("Connectivité", i.connectivity),
  ]);

// (Téléphone Portable “simple”)
export type FeaturePhoneSpecInput = BaseSpecInput & {
  screen?: string;
  battery?: string;
  sim?: string;
  network?: string; // 2G/3G/4G
  storage?: string;
};

export const phoneSpecs = (i: FeaturePhoneSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Écran", i.screen),
    s("Batterie", i.battery),
    s("SIM", i.sim),
    s("Réseau", i.network),
    s("Mémoire", i.storage),
  ]);

// iPhone (spécifique)
export type IPhoneSpecInput = BaseSpecInput & {
  storage?: string;
  screen?: string;
  chip?: string;
  camera?: string;
  battery?: string;
  connectivity?: string;
  ios?: string;
  faceId?: string; // "Oui"
};

export const iPhoneSpecs = (i: IPhoneSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Stockage", i.storage),
    s("Écran", i.screen),
    s("Puce", i.chip),
    s("Caméra", i.camera),
    s("Batterie", i.battery),
    s("Face ID", i.faceId),
    s("Système", i.ios),
    s("Connectivité", i.connectivity),
  ]);

// -------------------------
// 🧺 Lavage
// -------------------------
export type WashingMachineSpecInput = BaseSpecInput & {
  type?: string; // "Frontale" / "Top"
  capacity?: string; // "8 kg"
  spin?: string; // "1200 tr/min"
  energy?: string; // "A+++"
  programs?: string;
  motor?: string; // "Inverter"
  noise?: string;
  dimensions?: string; // "L×H×P"
};

export const washingMachineSpecs = (i: WashingMachineSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Capacité", i.capacity),
    s("Essorage", i.spin),
    s("Classe énergétique", i.energy),
    s("Moteur", i.motor),
    s("Programmes", i.programs),
    s("Niveau sonore", i.noise),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type DishwasherSpecInput = BaseSpecInput & {
  placeSettings?: string; // "12 couverts"
  programs?: string;
  energy?: string;
  waterConsumption?: string;
  noise?: string;
  dimensions?: string;
};

export const dishwasherSpecs = (i: DishwasherSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Capacité", i.placeSettings),
    s("Programmes", i.programs),
    s("Classe énergétique", i.energy),
    s("Consommation d’eau", i.waterConsumption),
    s("Niveau sonore", i.noise),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

// -------------------------
// ❄️ Froid
// -------------------------
export type RefrigeratorSpecInput = BaseSpecInput & {
  type?: string; // "Combiné", "2 portes", "Side by Side"
  cooling?: string; // "NoFrost"
  netTotal?: string;
  grossTotal?: string;
  netFridge?: string;
  netFreezer?: string;
  energy?: string;
  features?: string; // technologies
  dimensions?: string;
};

export const refrigeratorSpecs = (i: RefrigeratorSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Refroidissement", i.cooling),
    s("Capacité brute totale", i.grossTotal),
    s("Capacité nette totale", i.netTotal),
    s("Net réfrigérateur", i.netFridge),
    s("Net congélateur", i.netFreezer),
    s("Classe énergétique", i.energy),
    s("Technologies", i.features),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type FreezerSpecInput = BaseSpecInput & {
  type?: string; // "Coffre" / "Armoire"
  capacity?: string; // "300 L"
  cooling?: string; // NoFrost / Statique
  energy?: string;
  dimensions?: string;
};

export const freezerSpecs = (i: FreezerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Capacité", i.capacity),
    s("Refroidissement", i.cooling),
    s("Classe énergétique", i.energy),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type MiniFridgeSpecInput = BaseSpecInput & {
  capacity?: string;
  cooling?: string;
  energy?: string;
  dimensions?: string;
};

export const miniFridgeSpecs = (i: MiniFridgeSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Capacité", i.capacity),
    s("Refroidissement", i.cooling),
    s("Classe énergétique", i.energy),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

// -------------------------
// 🍳 Cuisson
// -------------------------
export type BuiltInOvenSpecInput = BaseSpecInput & {
  type?: string; // "Électrique" / "Gaz"
  capacity?: string; // "65 L"
  power?: string; // "3000 W"
  energy?: string;
  functions?: string; // "Chaleur tournante, Grill..."
  dimensions?: string;
};

export const builtInOvenSpecs = (i: BuiltInOvenSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Capacité", i.capacity),
    s("Puissance", i.power),
    s("Classe énergétique", i.energy),
    s("Fonctions", i.functions),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type FreestandingOvenSpecInput = BaseSpecInput & {
  type?: string;
  capacity?: string;
  power?: string;
  functions?: string;
  dimensions?: string;
};

export const freestandingOvenSpecs = (i: FreestandingOvenSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Capacité", i.capacity),
    s("Puissance", i.power),
    s("Fonctions", i.functions),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type CooktopSpecInput = BaseSpecInput & {
  type?: string; // "Gaz" / "Induction" / "Vitrocéramique"
  burners?: string; // "4 feux"
  power?: string;
  dimensions?: string;
  safety?: string; // "Sécurité gaz"
};

export const cooktopSpecs = (i: CooktopSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Foyers / Feux", i.burners),
    s("Puissance", i.power),
    s("Sécurité", i.safety),
    s("Dimensions", i.dimensions),
  ]);

export type HoodSpecInput = BaseSpecInput & {
  suction?: string; // "650 m³/h"
  levels?: string; // "3 vitesses"
  noise?: string;
  filters?: string; // "Alu / Charbon"
  lighting?: string; // "LED"
  dimensions?: string;
};

export const hoodSpecs = (i: HoodSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Débit d’aspiration", i.suction),
    s("Vitesses", i.levels),
    s("Niveau sonore", i.noise),
    s("Filtres", i.filters),
    s("Éclairage", i.lighting),
    s("Dimensions", i.dimensions),
  ]);

export type CookerSpecInput = BaseSpecInput & {
  type?: string; // "Gaz" / "Mixte" / "Électrique"
  burners?: string; // "4 feux"
  ovenCapacity?: string; // "65 L"
  dimensions?: string;
};

export const cookerSpecs = (i: CookerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Feux", i.burners),
    s("Capacité four", i.ovenCapacity),
    s("Dimensions (L×H×P)", i.dimensions),
  ]);

export type MicrowaveSpecInput = BaseSpecInput & {
  capacity?: string; // "25 L"
  power?: string; // "900 W"
  grill?: string; // "Oui/Non"
  functions?: string;
  dimensions?: string;
};

export const microwaveSpecs = (i: MicrowaveSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Capacité", i.capacity),
    s("Puissance", i.power),
    s("Grill", i.grill),
    s("Fonctions", i.functions),
    s("Dimensions", i.dimensions),
  ]);

// -------------------------
// 🥣 Préparation culinaire
// -------------------------
export type FoodProcessorSpecInput = BaseSpecInput & {
  power?: string;
  capacity?: string;
  speeds?: string;
  accessories?: string;
};

export const foodProcessorSpecs = (i: FoodProcessorSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Capacité", i.capacity),
    s("Vitesses", i.speeds),
    s("Accessoires", i.accessories),
  ]);

export type DoughMixerSpecInput = BaseSpecInput & {
  bowl?: string; // "5 L"
  power?: string;
  speeds?: string;
  accessories?: string;
};

export const doughMixerSpecs = (i: DoughMixerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Bol", i.bowl),
    s("Puissance", i.power),
    s("Vitesses", i.speeds),
    s("Accessoires", i.accessories),
  ]);

export type HandMixerSpecInput = BaseSpecInput & {
  power?: string;
  speeds?: string;
  turbo?: string;
  accessories?: string;
};

export const handMixerSpecs = (i: HandMixerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Vitesses", i.speeds),
    s("Turbo", i.turbo),
    s("Accessoires", i.accessories),
  ]);

export type BlenderSpecInput = BaseSpecInput & {
  power?: string;
  jug?: string; // "1.5 L"
  speeds?: string;
  iceCrush?: string;
};

export const blenderSpecs = (i: BlenderSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Bol / Pichet", i.jug),
    s("Vitesses", i.speeds),
    s("Glace pilée", i.iceCrush),
  ]);

export type ChopperSpecInput = BaseSpecInput & {
  power?: string;
  bowl?: string;
  blades?: string;
};

export const chopperSpecs = (i: ChopperSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Bol", i.bowl),
    s("Lames", i.blades),
  ]);

export type BreadMachineSpecInput = BaseSpecInput & {
  power?: string;
  capacity?: string; // "1 kg"
  programs?: string;
};

export const breadMachineSpecs = (i: BreadMachineSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Capacité", i.capacity),
    s("Programmes", i.programs),
  ]);

export type KitchenScaleSpecInput = BaseSpecInput & {
  max?: string; // "5 kg"
  precision?: string; // "1 g"
  battery?: string;
};

export const kitchenScaleSpecs = (i: KitchenScaleSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Max", i.max),
    s("Précision", i.precision),
    s("Alimentation", i.battery),
  ]);

// -------------------------
// 🔥 Chauffage & Chauffe-Eau
// -------------------------
export type ElectricHeaterSpecInput = BaseSpecInput & {
  power?: string;
  levels?: string;
  thermostat?: string;
  safety?: string;
};

export const electricHeaterSpecs = (i: ElectricHeaterSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Niveaux", i.levels),
    s("Thermostat", i.thermostat),
    s("Sécurité", i.safety),
  ]);

export type GasHeaterSpecInput = BaseSpecInput & {
  power?: string;
  consumption?: string;
  safety?: string;
  ignition?: string;
};

export const gasHeaterSpecs = (i: GasHeaterSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Consommation", i.consumption),
    s("Allumage", i.ignition),
    s("Sécurité", i.safety),
  ]);

export type OilRadiatorSpecInput = BaseSpecInput & {
  power?: string;
  fins?: string; // "9 ailettes"
  thermostat?: string;
  safety?: string;
};

export const oilRadiatorSpecs = (i: OilRadiatorSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Ailettes", i.fins),
    s("Thermostat", i.thermostat),
    s("Sécurité", i.safety),
  ]);

export type WaterHeaterSpecInput = BaseSpecInput & {
  type?: string; // "Chauffe bain" / "Électrique"
  capacity?: string; // "50 L"
  power?: string;
  installation?: string; // "Murale"
};

export const waterHeaterSpecs = (i: WaterHeaterSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Capacité", i.capacity),
    s("Puissance", i.power),
    s("Installation", i.installation),
  ]);

// -------------------------
// ☕ Café et Petit déjeuner
// -------------------------
export type CoffeeMakerSpecInput = BaseSpecInput & {
  type?: string; // filtre / expresso
  power?: string;
  capacity?: string; // "1.25 L"
  pressure?: string; // "15 bars"
  functions?: string;
};

export const coffeeMakerSpecs = (i: CoffeeMakerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Puissance", i.power),
    s("Capacité", i.capacity),
    s("Pression", i.pressure),
    s("Fonctions", i.functions),
  ]);

export type MilkFrotherSpecInput = BaseSpecInput & {
  capacity?: string;
  modes?: string;
};

export const milkFrotherSpecs = (i: MilkFrotherSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Capacité", i.capacity), s("Modes", i.modes)]);

export type CitrusPressSpecInput = BaseSpecInput & {
  power?: string;
  capacity?: string;
};

export const citrusPressSpecs = (i: CitrusPressSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Puissance", i.power), s("Capacité", i.capacity)]);

export type KettleSpecInput = BaseSpecInput & {
  power?: string;
  capacity?: string;
  material?: string;
};

export const kettleSpecs = (i: KettleSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Puissance", i.power), s("Capacité", i.capacity), s("Matériau", i.material)]);

export type CoffeeGrinderSpecInput = BaseSpecInput & {
  power?: string;
  capacity?: string;
  levels?: string;
};

export const coffeeGrinderSpecs = (i: CoffeeGrinderSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Puissance", i.power), s("Capacité", i.capacity), s("Niveaux", i.levels)]);

export type CapsuleMachineSpecInput = BaseSpecInput & {
  system?: string; // Nespresso/Dolce Gusto
  pressure?: string;
  tank?: string; // "1 L"
};

export const capsuleMachineSpecs = (i: CapsuleMachineSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Système", i.system), s("Pression", i.pressure), s("Réservoir", i.tank)]);

export type TeaMachineSpecInput = BaseSpecInput & {
  capacity?: string;
  temperature?: string;
  programs?: string;
};

export const teaMachineSpecs = (i: TeaMachineSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Capacité", i.capacity), s("Température", i.temperature), s("Programmes", i.programs)]);

// -------------------------
// ❄️ Climatisation
// -------------------------
export type AirConditionerSpecInput = BaseSpecInput & {
  capacity?: string; // BTU
  mode?: string; // chaud/froid
  compressor?: string;
  area?: string; // m²
  wifi?: string;
  features?: string;
};

export const airConditionerSpecs = (i: AirConditionerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Capacité", i.capacity),
    s("Mode", i.mode),
    s("Compresseur", i.compressor),
    s("Surface recommandée", i.area),
    s("Connectivité", i.wifi),
    s("Fonctions", i.features),
  ]);

export type FanSpecInput = BaseSpecInput & {
  type?: string; // "Sur pied" / "Murale"
  power?: string;
  speeds?: string;
  diameter?: string;
  noise?: string;
};

export const fanSpecs = (i: FanSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Puissance", i.power),
    s("Vitesses", i.speeds),
    s("Diamètre", i.diameter),
    s("Niveau sonore", i.noise),
  ]);

export type AirCoolerSpecInput = BaseSpecInput & {
  tank?: string; // "10 L"
  area?: string;
  power?: string;
  functions?: string;
};

export const airCoolerSpecs = (i: AirCoolerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Réservoir", i.tank),
    s("Surface recommandée", i.area),
    s("Puissance", i.power),
    s("Fonctions", i.functions),
  ]);

// -------------------------
// ⌚ Smartwatch
// -------------------------
export type SmartwatchSpecInput = BaseSpecInput & {
  screen?: string;
  battery?: string;
  waterResistant?: string;
  sensors?: string;
  connectivity?: string; // BT, GPS, NFC
  compatibility?: string; // iOS/Android
};

export const smartwatchSpecs = (i: SmartwatchSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Écran", i.screen),
    s("Batterie", i.battery),
    s("Étanchéité", i.waterResistant),
    s("Capteurs", i.sensors),
    s("Connectivité", i.connectivity),
    s("Compatibilité", i.compatibility),
  ]);

export type FitnessBandSpecInput = BaseSpecInput & {
  screen?: string;
  battery?: string;
  sensors?: string;
  waterResistant?: string;
};

export const fitnessBandSpecs = (i: FitnessBandSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Écran", i.screen), s("Batterie", i.battery), s("Capteurs", i.sensors), s("Étanchéité", i.waterResistant)]);

// -------------------------
// 📺 Téléviseurs + Box/Recepteurs
// -------------------------
export type TVLedSpecInput = BaseSpecInput & {
  size?: string;
  resolution?: string;
  os?: string;
  hdr?: string;
  ports?: string;
  audio?: string;
};

export const tvLedSpecs = (i: TVLedSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Taille écran", i.size),
    s("Résolution", i.resolution),
    s("Système", i.os),
    s("HDR", i.hdr),
    s("Audio", i.audio),
    s("Connecteurs", i.ports),
  ]);

export type AndroidBoxSpecInput = BaseSpecInput & {
  os?: string;
  storage?: string;
  ram?: string;
  wifi?: string;
  ports?: string;
  resolution?: string; // 4K
};

export const androidBoxSpecs = (i: AndroidBoxSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Système", i.os),
    s("Stockage", i.storage),
    s("RAM", i.ram),
    s("Résolution", i.resolution),
    s("Wi-Fi", i.wifi),
    s("Connecteurs", i.ports),
  ]);

export type ReceiverSpecInput = BaseSpecInput & {
  type?: string; // DVB-S2/DVB-T2
  resolution?: string;
  wifi?: string;
  ports?: string;
  features?: string;
};

export const receiverSpecs = (i: ReceiverSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Résolution", i.resolution),
    s("Wi-Fi", i.wifi),
    s("Connecteurs", i.ports),
    s("Fonctions", i.features),
  ]);

export type PowerAdapterSpecInput = BaseSpecInput & {
  power?: string; // "12V 2A"
  connector?: string;
  compatibility?: string;
};

export const powerAdapterSpecs = (i: PowerAdapterSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Puissance", i.power), s("Connecteur", i.connector), s("Compatibilité", i.compatibility)]);

// -------------------------
// 🎧 Son Numérique
// -------------------------
export type EarbudsSpecInput = BaseSpecInput & {
  battery?: string;
  noiseCancel?: string;
  waterResistant?: string;
  connectivity?: string;
  latency?: string;
};

export const earbudsSpecs = (i: EarbudsSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Batterie", i.battery),
    s("Réduction de bruit", i.noiseCancel),
    s("Étanchéité", i.waterResistant),
    s("Connectivité", i.connectivity),
    s("Latence", i.latency),
  ]);

export type HeadphonesSpecInput = BaseSpecInput & {
  type?: string; // "Casque"
  noiseCancel?: string;
  battery?: string;
  connectivity?: string;
};

export const headphonesSpecs = (i: HeadphonesSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Réduction de bruit", i.noiseCancel),
    s("Batterie", i.battery),
    s("Connectivité", i.connectivity),
  ]);

export type SpeakerSpecInput = BaseSpecInput & {
  power?: string;
  battery?: string;
  connectivity?: string;
  waterproof?: string;
};

export const speakerSpecs = (i: SpeakerSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Puissance", i.power),
    s("Batterie", i.battery),
    s("Connectivité", i.connectivity),
    s("Résistance", i.waterproof),
  ]);

// -------------------------
// 📺 Accessoires TV
// -------------------------
export type TvMountSpecInput = BaseSpecInput & {
  sizeCompat?: string; // "32–65\""
  type?: string; // Fixe / Inclinable / Orientable
  vesa?: string;
  maxLoad?: string;
};

export const tvMountSpecs = (i: TvMountSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Compatibilité", i.sizeCompat),
    s("Type", i.type),
    s("VESA", i.vesa),
    s("Charge max", i.maxLoad),
  ]);

export type TvDongleSpecInput = BaseSpecInput & {
  resolution?: string; // 4K
  os?: string;
  wifi?: string;
  ports?: string;
};

export const tvDongleSpecs = (i: TvDongleSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Résolution", i.resolution),
    s("Système", i.os),
    s("Wi-Fi", i.wifi),
    s("Connecteurs", i.ports),
  ]);

export type RemoteSpecInput = BaseSpecInput & {
  compatibleWith?: string;
  type?: string; // IR / Bluetooth
  batteries?: string;
};

export const remoteSpecs = (i: RemoteSpecInput): ProductSpec[] =>
  only([...baseSpecs(i), s("Compatible", i.compatibleWith), s("Type", i.type), s("Piles", i.batteries)]);

// -------------------------
// 🚰 Fontaine d'eau
// -------------------------
export type WaterDispenserSpecInput = BaseSpecInput & {
  type?: string; // Eau chaude/froide
  tanks?: string; // "2 robinets"
  cooling?: string;
  heating?: string;
  bottleType?: string; // "Bonbonne"
  dimensions?: string;
};

export const waterDispenserSpecs = (i: WaterDispenserSpecInput): ProductSpec[] =>
  only([
    ...baseSpecs(i),
    s("Type", i.type),
    s("Robinets", i.tanks),
    s("Refroidissement", i.cooling),
    s("Chauffage", i.heating),
    s("Format bouteille", i.bottleType),
    s("Dimensions", i.dimensions),
  ]);
