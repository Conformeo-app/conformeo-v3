export type QuickCapturePatternKey =
  | "photo"
  | "note"
  | "checklist"
  | "signature"
  | "signalement";

export interface QuickCapturePattern {
  key: QuickCapturePatternKey;
  title: string;
  summary: string;
  primaryActionLabel: string;
  stepCount: 2 | 3;
  steps: string[];
  localOutcome: string;
  offlineNote: string;
}

export const QUICK_CAPTURE_PATTERNS: QuickCapturePattern[] = [
  {
    key: "photo",
    title: "Photo",
    summary: "Capturer une preuve visuelle sans quitter le terrain.",
    primaryActionLabel: "Prendre la photo",
    stepCount: 3,
    steps: [
      "Ouvrir l’appareil photo directement depuis l’action courte.",
      "Vérifier seulement la miniature et l’horodatage.",
      "Enregistrer immédiatement sur l’appareil."
    ],
    localOutcome: "preuve locale prête",
    offlineNote: "La preuve reste locale et visible tout de suite, même sans réseau."
  },
  {
    key: "note",
    title: "Note",
    summary: "Saisir une information terrain en quelques secondes.",
    primaryActionLabel: "Écrire la note",
    stepCount: 2,
    steps: [
      "Saisir la note avec un seul champ principal.",
      "Enregistrer directement sur l’appareil."
    ],
    localOutcome: "note locale prête",
    offlineNote: "Aucune dépendance réseau : la note part dans les brouillons locaux."
  },
  {
    key: "checklist",
    title: "Checklist",
    summary: "Cocher une courte série de points sans écran chargé.",
    primaryActionLabel: "Cocher la checklist",
    stepCount: 3,
    steps: [
      "Afficher une liste courte de points directement actionnables.",
      "Relire seulement le résumé des éléments restants ou bloquants.",
      "Enregistrer localement l’état de la checklist."
    ],
    localOutcome: "checklist locale prête",
    offlineNote: "Les coches restent disponibles localement et pourront repartir plus tard."
  },
  {
    key: "signature",
    title: "Signature",
    summary: "Capturer un accord terrain sans détour.",
    primaryActionLabel: "Signer",
    stepCount: 3,
    steps: [
      "Afficher immédiatement la zone de signature.",
      "Confirmer visuellement le tracé ou recommencer.",
      "Enregistrer la signature sur l’appareil."
    ],
    localOutcome: "signature locale prête",
    offlineNote: "La signature doit rester locale et traçable avant tout envoi serveur."
  },
  {
    key: "signalement",
    title: "Signalement",
    summary: "Déclarer vite un écart ou un incident terrain.",
    primaryActionLabel: "Signaler",
    stepCount: 3,
    steps: [
      "Décrire brièvement le problème ou joindre une photo.",
      "Choisir un niveau d’attention simple.",
      "Enregistrer localement le signalement."
    ],
    localOutcome: "signalement local prêt",
    offlineNote: "Le signalement doit rester actionnable même en connectivité dégradée."
  }
];
