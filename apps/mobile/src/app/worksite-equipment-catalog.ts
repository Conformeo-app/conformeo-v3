import type { WorksiteEquipment, WorksiteSummary } from "@conformeo/contracts";

interface WorksiteEquipmentTemplate {
  matchName: string;
  items: Array<Pick<WorksiteEquipment, "name" | "type" | "status">>;
}

const WORKSITE_EQUIPMENT_TEMPLATES: WorksiteEquipmentTemplate[] = [
  {
    matchName: "Carnot",
    items: [
      { name: "Chaudière gaz toiture", type: "Chauffage", status: "ready" },
      { name: "Circulateur secondaire", type: "Hydraulique", status: "attention" },
      { name: "Armoire de régulation", type: "Pilotage", status: "ready" }
    ]
  },
  {
    matchName: "Mazure",
    items: [
      { name: "CTA étage 2", type: "Ventilation", status: "ready" },
      { name: "Variateur soufflage", type: "Électrique", status: "attention" },
      { name: "Extracteur parking", type: "Extraction", status: "unavailable" }
    ]
  },
  {
    matchName: "Pasteur",
    items: [
      { name: "Centrale incendie bâtiment B", type: "Sécurité", status: "attention" },
      { name: "Porte coupe-feu sous-sol", type: "Accès", status: "ready" },
      { name: "Bloc secours hall accueil", type: "Éclairage", status: "ready" }
    ]
  }
];

export function getDefaultWorksiteEquipments(
  worksite: Pick<WorksiteSummary, "id" | "name">
): WorksiteEquipment[] {
  const template = WORKSITE_EQUIPMENT_TEMPLATES.find((item) =>
    worksite.name.includes(item.matchName)
  );

  if (!template) {
    return [];
  }

  return template.items.map((item, index) => ({
    id: `${worksite.id}-equipment-${index + 1}`,
    name: item.name,
    type: item.type,
    status: item.status
  }));
}
