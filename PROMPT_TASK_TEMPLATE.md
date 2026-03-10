# PROMPT_TASK_TEMPLATE.md — Template Codex par sprint / ticket

## TÂCHE
Tu travailles sur Conforméo.
Exécute uniquement le périmètre ci-dessous.

## SPRINT
[Sprint X — Nom du sprint]

## OBJECTIF
[Décrire en 1 à 3 phrases le vrai résultat attendu]

## CONTEXTE
- Module concerné : [Réglementation / Chantier / Facturation / Socle]
- Surface concernée : [Desktop Angular / Mobile Ionic-Angular / API FastAPI]
- Enjeu principal : [offline-first / conformité / UX / sync / documents / facturation]
- Pourquoi c’est important : [impact métier]

## PÉRIMÈTRE STRICT
Tu dois implémenter uniquement :
- [élément 1]
- [élément 2]
- [élément 3]

Tu ne dois pas implémenter :
- [hors périmètre 1]
- [hors périmètre 2]
- [hors périmètre 3]

## FICHIERS / DOSSIERS À LIRE D’ABORD
- AGENTS.md
- [apps/web/...]
- [apps/mobile/...]
- [apps/api/...]
- [packages/types/...]
- [autres fichiers importants]

## ENTITÉS / MODÈLES CONCERNÉS
- [Organization]
- [Project/Chantier]
- [Evidence]
- [Document]
- [Invoice]
- [etc.]

## COMPORTEMENT ATTENDU
- [décrire le comportement utilisateur]
- [décrire le comportement métier]
- [décrire le comportement technique]

## CRITÈRES D’ACCEPTATION
- [critère 1]
- [critère 2]
- [critère 3]
- [critère 4]

## CONTRAINTES TECHNIQUES
- Respecter l’architecture existante
- Ne pas casser les types partagés
- Préserver le fonctionnement offline-first si concerné
- Ne pas introduire de dépendance lourde sans justification
- Préférer des changements petits et relisibles

## CONTRAINTES UX
- Interface simple
- Langage clair
- Pas de surcharge visuelle
- Si mobile : utilisable rapidement, en faible attention
- Si sync : état de synchronisation compréhensible

## SORTIE ATTENDUE
Je veux que tu :
1. Résumes d’abord ce que tu as compris
2. Proposes un plan court
3. Implémentes
4. Exécutes les vérifications pertinentes
5. Me donnes :
   - les fichiers modifiés
   - ce qui a été fait
   - ce qui reste éventuellement à faire
   - la prochaine petite étape logique

## SI TU ES BLOQUÉ
- N’invente pas un comportement non demandé
- N’élargis pas le périmètre
- Arrête-toi à un point stable
- Explique précisément le blocage

---

## Exemple ultra court d’usage

### Exemple : S1-010 Photo preuve horodatée

TÂCHE
Implémenter S1-010 Photo preuve horodatée.

OBJECTIF
Permettre à un utilisateur mobile de capturer une photo preuve rattachée à un chantier, avec horodatage automatique, stockage local immédiat et compatibilité offline-first.

CONTEXTE
- Module concerné : Chantier
- Surface concernée : Mobile Ionic-Angular
- Enjeu principal : offline-first / preuves terrain
- Pourquoi c’est important : la capture preuve est un workflow critique chantier

PÉRIMÈTRE STRICT
Tu dois implémenter uniquement :
- capture photo depuis mobile
- rattachement obligatoire à un chantier
- horodatage automatique
- stockage local immédiat
- miniature locale immédiate
- géolocalisation facultative si disponible

Tu ne dois pas implémenter :
- détourage IA
- annotation photo avancée
- OCR
- galerie documentaire complète

CRITÈRES D’ACCEPTATION
- une photo peut être capturée depuis l’app mobile
- la photo est rattachée à un chantier
- l’horodatage est conservé
- la photo reste disponible localement sans réseau
- une miniature s’affiche immédiatement
- le code reste cohérent avec l’architecture offline-first
