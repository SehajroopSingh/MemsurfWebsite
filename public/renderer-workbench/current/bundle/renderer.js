(function () {
      const payloadNode = document.getElementById("grid-layout-data");
      const rootNode = document.getElementById("grid-layout-root");
      let documentPayload = {};
      let hasPlayedFlowEntranceAnimation = false;
      let hasPlayedCompareEntranceAnimation = false;

      try {
        documentPayload = JSON.parse(payloadNode.textContent || "{}");
      } catch (error) {
        rootNode.innerHTML = '<div class="cell-card">Unable to parse grid preview payload.</div>';
        return;
      }

      const theme = documentPayload.theme === "dark" ? "dark" : "light";
      const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const previewStylePolicy = "preview";
      const randomizedStableUnlockedStylePolicy = "randomized-stable-unlocked";
      const legacyFirstOnlyStylePolicy = "first-only";
      const requestedStylePolicy = documentPayload.stylePolicy || documentPayload.style_policy;
      const stylePolicy = requestedStylePolicy === previewStylePolicy ? previewStylePolicy : randomizedStableUnlockedStylePolicy;
      const isRandomizedStableUnlockedPolicy = stylePolicy === randomizedStableUnlockedStylePolicy || requestedStylePolicy === legacyFirstOnlyStylePolicy;
      const gridcellRenderStyles = {
        TextCell: {
          orientation: ["glass-card", "edge-note", "frosted-panel", "notification", "paper-note", "corner-focus"],
          body: ["editorial", "dropcap", "notebook", "briefing"],
          definition: ["lexicon", "specimen", "ribbon"],
          quote: ["aperture", "margin", "signal"],
          rule: ["compass", "circuit", "stamp"],
          example: ["detached-title", "center-focus", "side-note"],
          warning: ["floating-label", "center-focus", "quiet-rule"],
          caption: ["plate", "filmstrip", "whisper"]
        },
        HeadingCell: ["masthead", "tab", "runway"],
        ImageCell: ["gallery", "polaroid", "viewport"],
        CompareCell: ["splitbeam", "scorecard", "hinge"],
        PairCell: ["duet", "bridge", "mirror"],
        KeyValueCell: ["ledger", "chips", "specsheet"],
        TripletCell: ["cascade", "orbit", "blueprint"],
        RecallPromptCell: ["peel", "flashcard", "focus-lens"],
        KeyPointsCell: ["orb", "halo", "rail", "marker"],
        TimelineStepCell: ["rail", "milestone", "ticker"],
        ProcessStepCell: ["pipeline", "gearpath", "handoff"],
        MathExpressionCell: ["chalk", "glass", "proofline", "signal", "notebook"],
        FunctionPlotCell: ["oscilloscope", "graphpaper", "neoncurve"],
        MiniChartCell: ["dashboard", "spark", "instrument"],
        CodeTraceCell: ["terminal", "diff", "debugger"],
        MapRegionCell: ["atlas", "radar", "routecard"],
        SpacerCell: ["breather", "divider", "labelstrip"]
      };
      const keypointRenderStyles = gridcellRenderStyles.KeyPointsCell;
      const textCellRenderStyles = gridcellRenderStyles.TextCell;
      const relationshipRenderStyles = {
        pair: {
          parallel_examples: ["duet", "mirror", "shared-rail"],
          contrast: ["versus-split", "opposing-corners", "tension-line"],
          before_after: ["then-now", "transition-track", "wipe"],
          problem_solution: ["diagnosis-fix", "lock-key", "repair-card"],
          cause_effect: ["ripple", "domino", "causal-arrow"],
          example_nonexample: ["check-cross", "sample-filter", "green-red"],
          claim_evidence: ["brief-proof", "citation-stack", "argument-line"]
        },
        keyValue: {
          neutral: ["ledger", "index-card", "quiet-sheet"],
          key: ["priority-strip", "anchor-list", "highlight-sheet"],
          definition: ["lexicon", "spec-sheet", "term-table"],
          example: ["case-notes", "sample-sheet", "worked-list"]
        },
        triplet: {
          cause_mechanism_effect: ["domino-flow", "mechanism-bridge", "ripple-chain"],
          input_process_output: ["pipeline", "machine-flow", "transformer"],
          problem_method_result: ["solve-path", "method-card", "outcome-lift"],
          claim_evidence_implication: ["evidence-rail", "logic-ladder", "inference-cascade"],
          trigger_response_outcome: ["pulse-chain", "signal-response", "reaction-path"],
          before_change_after: ["time-slice", "change-bridge", "then-now"]
        }
      };
      const rendererStyleAvailability = compactRendererStyleAvailability(readRendererStyleAvailability());
      document.documentElement.setAttribute("data-theme", theme);

      function readRendererStyleAvailability() {
        const globalAvailability = window.__lessonRendererStyleAvailability;
        if (globalAvailability && typeof globalAvailability === "object" && !Array.isArray(globalAvailability)) {
          return globalAvailability;
        }
        const availabilityNode = document.getElementById("renderer-style-availability-data");
        if (!availabilityNode) {
          return {};
        }
        try {
          return JSON.parse(availabilityNode.textContent || "{}");
        } catch (error) {
          return {};
        }
      }

      function styleAvailabilityItemIsUnlocked(item) {
        if (!item || typeof item !== "object") {
          return false;
        }
        if (item.isLocked === true || item.is_locked === true) {
          return false;
        }
        if (item.realLessonEnabled === false || item.real_lesson_enabled === false) {
          return false;
        }
        return true;
      }

      function normalizeAvailabilityGroup(group) {
        const rawStyles = Array.isArray(group.styles) ? group.styles : [];
        const unlockedStyles = rawStyles
          .filter(styleAvailabilityItemIsUnlocked)
          .map(function (style) {
            return safeText(style.styleId || style.style_id);
          })
          .filter(Boolean);
        const defaultStyle = safeText(group.defaultStyleId || group.default_style_id);
        return {
          defaultStyleId: unlockedStyles.includes(defaultStyle) ? defaultStyle : (unlockedStyles[0] || ""),
          styles: unlockedStyles,
          isLocked: group.isLocked === true || group.is_locked === true || unlockedStyles.length === 0
        };
      }

      function compactRendererStyleAvailability(availability) {
        const compact = { cell: {}, relationship: {}, tripletAssignments: [] };
        const groups = availability && Array.isArray(availability.groups) ? availability.groups : [];
        groups.forEach(function (group) {
          const cellType = safeText(group.cellType || group.cell_type);
          const layoutKind = safeText(group.layoutKind || group.layout_kind);
          const layoutId = safeText(group.layoutId || group.layout_id);
          const styleKey = safeText(group.styleKey || group.style_key);
          const relationshipKind = safeText(group.relationshipKind || group.relationship_kind);
          const relationshipMode = safeText(group.relationshipMode || group.relationship_mode);
          const renderMode = safeText(group.renderMode || group.render_mode);
          const normalizedGroup = normalizeAvailabilityGroup(group);

          if (layoutKind === "triplet_layout") {
            compact.tripletAssignments.push({
              renderMode: renderMode || layoutId,
              relation: relationshipMode,
              orientation: safeText(group.orientation) || "vertical",
              defaultStyleId: normalizedGroup.defaultStyleId,
              styles: normalizedGroup.styles,
              isLocked: normalizedGroup.isLocked
            });
            return;
          }

          if (styleKey === "preview_relationship_style" && relationshipKind && relationshipMode) {
            if (!compact.relationship[relationshipKind]) {
              compact.relationship[relationshipKind] = {};
            }
            compact.relationship[relationshipKind][relationshipMode] = normalizedGroup;
            return;
          }

          if (styleKey === "preview_cell_style" && cellType) {
            const cellLayoutId = cellType === "TextCell" ? (renderMode || layoutId || "body") : "default";
            if (!compact.cell[cellType]) {
              compact.cell[cellType] = {};
            }
            compact.cell[cellType][cellLayoutId] = normalizedGroup;
          }
        });
        return compact;
      }

      function stableHash(value) {
        const text = safeText(value);
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      }

      function scenarioStyleKey(scenario, scenarioIndex) {
        const scenarioObject = scenario || {};
        const scenarioSlots = sortSlots(scenarioObject.slots).map(function (slot) {
          return {
            slot_id: safeText(slot.slot_id),
            cell_type: safeText(slot.cell_type || slot.type),
            r: numeric(slot.r, 0),
            c: numeric(slot.c, 0),
            rowspan: numeric(slot.rowspan, 1),
            colspan: numeric(slot.colspan, 1),
            props: slot.props || {},
            content: slot.content || {}
          };
        });
        const signature = JSON.stringify({
          index: numeric(scenarioIndex, 0),
          title: nonEmptyString(scenarioObject.title),
          subtitle: nonEmptyString(scenarioObject.subtitle),
          screenExplanation: nonEmptyString(scenarioObject.screenExplanation),
          grid: scenarioObject.grid || {},
          slots: scenarioSlots
        });
        return "scenario|" + safeText(scenarioIndex) + "|" + safeText(stableHash(signature));
      }

      function canonicalRequestedStyleForCell(cellType, subtype, requestedStyle) {
        const normalizedStyle = safeText(requestedStyle).trim().toLowerCase();
        if (cellType === "TextCell" && subtype === "warning") {
          const legacyWarningStyles = {
            radar: "floating-label",
            hazard: "center-focus",
            seal: "quiet-rule"
          };
          return legacyWarningStyles[normalizedStyle] || normalizedStyle;
        }
        return normalizedStyle;
      }

      function requestedStyleForCell(cellType, subtype, requestedStyle) {
        const styles = stylesForCell(cellType, subtype);
        const normalizedStyle = canonicalRequestedStyleForCell(cellType, subtype, requestedStyle);
        return styles.includes(normalizedStyle) ? normalizedStyle : "";
      }

      function styleSeedForCell(cellType) {
        const usesKeypointStyleInputs = boolFlag(documentPayload.hasExplicitKeypointStyle, false);
        if (cellType === "KeyPointsCell") {
          return firstNonEmpty([
            usesKeypointStyleInputs ? documentPayload.keypointStyleSeed : "",
            documentPayload.gridcellStyleSeed,
            usesKeypointStyleInputs ? "" : documentPayload.keypointStyleSeed,
            JSON.stringify(documentPayload.scenarios || [])
          ]);
        }
        if (cellType === "TextCell") {
          return firstNonEmpty([
            documentPayload.textCellStyleSeed,
            documentPayload.gridcellStyleSeed,
            documentPayload.relationshipCellStyleSeed,
            documentPayload.keypointStyleSeed,
            JSON.stringify(documentPayload.scenarios || [])
          ]);
        }
        return firstNonEmpty([
          documentPayload.gridcellStyleSeed,
          documentPayload.textCellStyleSeed,
          documentPayload.relationshipCellStyleSeed,
          documentPayload.keypointStyleSeed,
          JSON.stringify(documentPayload.scenarios || [])
        ]);
      }

      function styleOrdinalForCell(cellType, ordinalValue) {
        const explicitOrdinal = numeric(ordinalValue, NaN);
        if (Number.isFinite(explicitOrdinal)) {
          return Math.max(0, Math.trunc(explicitOrdinal));
        }
        const usesKeypointStyleInputs = boolFlag(documentPayload.hasExplicitKeypointStyle, false);
        let ordinalSource = 0;
        if (cellType === "KeyPointsCell") {
          const fallbackOrdinal = numeric(documentPayload.gridcellStyleOrdinal, 0);
          ordinalSource = usesKeypointStyleInputs
            ? numeric(documentPayload.keypointStyleOrdinal, fallbackOrdinal)
            : numeric(documentPayload.gridcellStyleOrdinal, numeric(documentPayload.keypointStyleOrdinal, 0));
        } else if (cellType === "TextCell") {
          ordinalSource = numeric(documentPayload.textCellStyleOrdinal, numeric(documentPayload.gridcellStyleOrdinal, 0));
        } else {
          ordinalSource = numeric(documentPayload.gridcellStyleOrdinal, 0);
        }
        return Math.max(0, Math.trunc(ordinalSource));
      }

      function styleOccurrenceOffset(occurrenceOrdinal) {
        return Math.max(0, Math.trunc(numeric(occurrenceOrdinal, 0)));
      }

      function selectedKeypointStyle(scenarioStyleKey, requestedStyle, occurrenceOrdinal) {
        const sectionStableOccurrence = isRandomizedStableUnlockedPolicy ? 0 : occurrenceOrdinal;
        return selectedCellStyle("KeyPointsCell", scenarioStyleKey, "default", undefined, requestedStyle, sectionStableOccurrence);
      }

      function relationshipStyleSeed() {
        const seed = firstNonEmpty([
          documentPayload.relationshipCellStyleSeed,
          documentPayload.gridcellStyleSeed,
          documentPayload.textCellStyleSeed,
          documentPayload.keypointStyleSeed,
          JSON.stringify(documentPayload.scenarios || [])
        ]);
        return seed;
      }

      function relationshipStyleOrdinal(ordinalValue) {
        const explicitOrdinal = numeric(ordinalValue, NaN);
        if (Number.isFinite(explicitOrdinal)) {
          return Math.max(0, Math.trunc(explicitOrdinal));
        }
        return Math.max(0, Math.trunc(numeric(
          documentPayload.relationshipCellStyleOrdinal,
          numeric(documentPayload.gridcellStyleOrdinal, 0)
        )));
      }

      function styleSubtypeForCell(cellType, props, content) {
        if (cellType === "TextCell") {
          return normalizedTextCellMode(props.render_mode);
        }
        if (cellType === "PairCell" || cellType === "TripletCell" || cellType === "KeyValueCell") {
          return relationshipRenderModeForCell(cellType, props);
        }
        if (cellType === "MathExpressionCell") {
          return relationshipClassToken(firstNonEmpty([props.emphasis]));
        }
        if (cellType === "MiniChartCell") {
          return relationshipClassToken(firstNonEmpty([content.chart_type]));
        }
        if (cellType === "MapRegionCell") {
          return relationshipClassToken(firstNonEmpty([content.map_kind]));
        }
        if (cellType === "SpacerCell") {
          return firstNonEmpty([content.label]) ? "labeled" : "empty";
        }
        return relationshipClassToken(firstNonEmpty([props.variant]));
      }

      function stylesForCell(cellType, subtype) {
        const registry = gridcellRenderStyles[cellType];
        if (Array.isArray(registry)) {
          return registry;
        }
        if (registry && typeof registry === "object") {
          return registry[subtype] || registry.body || registry.default || [];
        }
        return ["plain"];
      }

      function unlockedStylesForGroup(group, candidateStyles) {
        const styles = Array.isArray(candidateStyles) ? candidateStyles : [];
        if (!group) {
          return styles;
        }
        if (group.isLocked === true || group.is_locked === true) {
          return [];
        }
        const availableStyles = Array.isArray(group.styles) ? group.styles.map(safeText).filter(Boolean) : [];
        if (!availableStyles.length) {
          return [];
        }
        return availableStyles.filter(function (style) {
          return styles.includes(style);
        });
      }

      function cellStyleAvailabilityGroup(cellType, subtype) {
        const cellGroups = (rendererStyleAvailability.cell || {})[cellType] || {};
        if (cellType === "TextCell") {
          return cellGroups[subtype] || cellGroups.body || cellGroups.default || null;
        }
        return cellGroups.default || null;
      }

      function selectedUnlockedStyle(group, candidateStyles, seedKey, ordinalValue, unlockedFallback, lockedFallback) {
        const availableStyles = unlockedStylesForGroup(group, candidateStyles);
        if (!availableStyles.length) {
          return group ? (lockedFallback || "") : (unlockedFallback || "");
        }
        const ordinal = styleOccurrenceOffset(ordinalValue);
        const styleIndex = (stableHash(seedKey) + ordinal) % availableStyles.length;
        return availableStyles[styleIndex] || unlockedFallback || "";
      }

      function selectedUnlockedCellStyle(cellType, subtype, styles, scenarioStyleKey, occurrenceOrdinal) {
        const group = cellStyleAvailabilityGroup(cellType, subtype);
        const seed = styleSeedForCell(cellType);
        const stableKey = seed + "|" + safeText(scenarioStyleKey) + "|" + safeText(cellType) + "|" + safeText(subtype);
        return selectedUnlockedStyle(group, styles, stableKey, occurrenceOrdinal, styles[0] || "plain", "plain") || "plain";
      }

      function selectedCellStyle(cellType, scenarioStyleKey, subtype, ordinalValue, requestedStyle, occurrenceOrdinal) {
        const styles = stylesForCell(cellType, subtype);
        if (!styles.length) {
          return "plain";
        }
        if (isRandomizedStableUnlockedPolicy) {
          return selectedUnlockedCellStyle(cellType, subtype, styles, scenarioStyleKey, occurrenceOrdinal);
        }
        const previewStyle = requestedStyleForCell(cellType, subtype, requestedStyle);
        if (previewStyle) {
          return previewStyle;
        }
        const seed = styleSeedForCell(cellType);
        const ordinal = styleOrdinalForCell(cellType, ordinalValue) + styleOccurrenceOffset(occurrenceOrdinal);
        const styleIndex = (stableHash(seed + "|" + safeText(scenarioStyleKey) + "|" + safeText(cellType) + "|" + safeText(subtype)) + ordinal) % styles.length;
        return styles[styleIndex] || styles[0] || "plain";
      }

      function selectedTimelineStepSectionStyle(slots, scenarioStyleKey) {
        const firstTimelineSlot = (Array.isArray(slots) ? slots : []).find(function (slot) {
          return safeText(slot.cell_type || slot.type) === "TimelineStepCell";
        });
        if (!firstTimelineSlot) {
          return "";
        }
        const props = firstTimelineSlot.props || {};
        const content = firstTimelineSlot.content || {};
        const subtype = styleSubtypeForCell("TimelineStepCell", props, content);
        return selectedCellStyle("TimelineStepCell", scenarioStyleKey, subtype, undefined, firstTimelineSlot.preview_cell_style, 0);
      }

      function selectedTextCellStyle(mode, scenarioStyleKey, ordinalValue, occurrenceOrdinal) {
        return selectedCellStyle("TextCell", scenarioStyleKey, mode, ordinalValue, undefined, occurrenceOrdinal);
      }

      function relationshipCellKind(cellType) {
        switch (safeText(cellType)) {
          case "PairCell":
            return "pair";
          case "KeyValueCell":
            return "keyValue";
          case "TripletCell":
            return "triplet";
          default:
            return "";
        }
      }

      function relationshipCellClassPrefix(kind) {
        return kind === "keyValue" ? "key-value" : kind;
      }

      function relationshipClassToken(value) {
        const token = safeText(value)
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return token || "default";
      }

      function relationshipStyleModeForCell(cellType, props) {
        const kind = relationshipCellKind(cellType);
        if (kind === "pair") {
          return relationshipClassToken(firstNonEmpty([props.relation, "contrast"]));
        }
        if (kind === "keyValue") {
          return relationshipClassToken(firstNonEmpty([props.tone, "neutral"]));
        }
        if (kind === "triplet") {
          return relationshipClassToken(firstNonEmpty([props.relation, "cause_mechanism_effect"]));
        }
        return "";
      }

      function relationshipRenderModeForCell(cellType, props) {
        const kind = relationshipCellKind(cellType);
        if (kind === "pair") {
          return pairRenderMode(firstNonEmpty([props.relation, "contrast"]));
        }
        if (kind === "triplet") {
          return firstNonEmpty([
            normalizedTripletRenderMode(firstNonEmpty([props.render_mode, props.triplet_render_mode])),
            relationshipStyleModeForCell(cellType, props)
          ]);
        }
        return relationshipStyleModeForCell(cellType, props);
      }

      function relationshipStyleAvailabilityGroup(cellType, mode) {
        const kind = relationshipCellKind(cellType);
        const relationshipGroups = (rendererStyleAvailability.relationship || {})[kind] || {};
        return relationshipGroups[mode] || null;
      }

      function selectedUnlockedRelationshipStyle(cellType, mode, styles, scenarioStyleKey, occurrenceOrdinal) {
        const group = relationshipStyleAvailabilityGroup(cellType, mode);
        const seed = relationshipStyleSeed();
        const stableKey = seed + "|" + safeText(scenarioStyleKey) + "|relationship|" + safeText(cellType) + "|" + mode;
        return selectedUnlockedStyle(group, styles, stableKey, occurrenceOrdinal, styles[0] || "", "");
      }

      function relationshipSignatureForSlot(slot, content) {
        const slotObject = slot && typeof slot === "object" ? slot : {};
        return JSON.stringify({
          slot_id: safeText(slotObject.slot_id),
          cell_type: safeText(slotObject.cell_type || slotObject.type),
          r: numeric(slotObject.r, 0),
          c: numeric(slotObject.c, 0),
          rowspan: numeric(slotObject.rowspan, 1),
          colspan: numeric(slotObject.colspan, 1),
          content: content || {}
        });
      }

      function relationshipModeChoicesForCell(cellType) {
        const kind = relationshipCellKind(cellType);
        const styleGroup = relationshipRenderStyles[kind] || {};
        return Object.keys(styleGroup).filter(function (mode) {
          return Array.isArray(styleGroup[mode]) && styleGroup[mode].length > 0;
        });
      }

      function relationshipModeIsUnlocked(cellType, mode) {
        const kind = relationshipCellKind(cellType);
        const styles = ((relationshipRenderStyles[kind] || {})[mode] || []);
        return unlockedStylesForGroup(relationshipStyleAvailabilityGroup(cellType, mode), styles).length > 0;
      }

      function relationshipRenderModeForAssignment(cellType, mode) {
        const kind = relationshipCellKind(cellType);
        if (kind === "pair") {
          return pairRenderMode(mode);
        }
        return mode;
      }

      function relationshipRenderAssignmentForSlot(cellType, slot, content, scenarioStyleKey, occurrenceOrdinal) {
        if (cellType === "TripletCell") {
          const props = slot && slot.props ? slot.props : {};
          const mode = relationshipStyleModeForCell(cellType, props);
          const orientation = resolveTripletOrientation(props, slot, content, mode);
          return {
            relation: mode,
            renderMode: tripletRenderMode(mode, orientation),
            style: selectedRelationshipCellStyle(cellType, mode, scenarioStyleKey, undefined, undefined, occurrenceOrdinal)
          };
        }
        const modeChoices = relationshipModeChoicesForCell(cellType);
        const unlockedModeChoices = modeChoices.filter(function (mode) {
          return relationshipModeIsUnlocked(cellType, mode);
        });
        const assignmentChoices = unlockedModeChoices.length ? unlockedModeChoices : modeChoices;
        if (!assignmentChoices.length) {
          return null;
        }
        const signature = relationshipSignatureForSlot(slot, content);
        const seed = relationshipStyleSeed();
        const ordinal = styleOccurrenceOffset(occurrenceOrdinal);
        const mode = assignmentChoices[
          (stableHash(seed + "|" + safeText(scenarioStyleKey) + "|" + signature + "|relationship-render-assignment|" + safeText(cellType)) + ordinal) % assignmentChoices.length
        ] || assignmentChoices[0];
        return {
          relation: mode,
          renderMode: relationshipRenderModeForAssignment(cellType, mode),
          style: selectedRelationshipCellStyle(cellType, mode, scenarioStyleKey, undefined, undefined, occurrenceOrdinal)
        };
      }

      function selectedRelationshipCellStyle(cellType, mode, scenarioStyleKey, explicitStyle, ordinalValue, occurrenceOrdinal) {
        const kind = relationshipCellKind(cellType);
        const styleGroup = relationshipRenderStyles[kind] || {};
        const styles = styleGroup[mode] || [];
        if (!styles.length) {
          return "";
        }
        if (isRandomizedStableUnlockedPolicy) {
          return selectedUnlockedRelationshipStyle(cellType, mode, styles, scenarioStyleKey, occurrenceOrdinal);
        }
        const requestedStyle = relationshipClassToken(explicitStyle);
        if (styles.includes(requestedStyle)) {
          return requestedStyle;
        }
        const seed = relationshipStyleSeed();
        const ordinal = relationshipStyleOrdinal(ordinalValue) + styleOccurrenceOffset(occurrenceOrdinal);
        const styleIndex = (stableHash(seed + "|" + safeText(scenarioStyleKey) + "|relationship|" + safeText(cellType) + "|" + mode) + ordinal) % styles.length;
        return styles[styleIndex] || styles[0];
      }

      function safeText(value) {
        if (value === null || value === undefined) {
          return "";
        }
        return String(value);
      }

      function nonEmptyString(value) {
        const text = safeText(value).trim();
        return text.length > 0 ? text : "";
      }

      function firstNonEmpty(values) {
        for (const value of values) {
          const text = nonEmptyString(value);
          if (text) {
            return text;
          }
        }
        return "";
      }

      function numeric(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      }

      function boolFlag(value, fallback) {
        return typeof value === "boolean" ? value : fallback;
      }

      function escapeHTML(value) {
        return safeText(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function normalizeLatexFallbackText(value) {
        return safeText(value)
          .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "($1)/($2)")
          .replace(/\\text\s*\{([^{}]*)\}/g, "$1")
          .replace(/\\Rightarrow/g, "⇒")
          .replace(/\\rightarrow/g, "→")
          .replace(/\\left|\\right|\\quad|\\,|\\;|\\!/g, " ")
          .replace(/\\ln/g, "ln")
          .replace(/\\theta/g, "theta")
          .replace(/\\epsilon/g, "epsilon")
          .replace(/\\times/g, "×")
          .replace(/\\cdot/g, "·")
          .replace(/[{}]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      function renderInlineNotationInEscapedText(text) {
        if (!text || /https?:\/\/|www\.|@/.test(text)) {
          return text || "";
        }
        let html = text.replace(/\b([A-Za-z])_\{([A-Za-z0-9]+)\}/g, function (_match, base, subscript) {
          return '<span class="inline-notation"><span>' + base + '</span><sub>' + subscript + '</sub></span>';
        });
        html = html.replace(/\b([A-Za-z])_([A-Za-z0-9]+)\b/g, function (_match, base, subscript) {
          return '<span class="inline-notation"><span>' + base + '</span><sub>' + subscript + '</sub></span>';
        });
        html = html.replace(/\b([A-Za-z])\^\{([A-Za-z0-9]+)\}/g, function (_match, base, superscript) {
          return '<span class="inline-notation"><span>' + base + '</span><sup>' + superscript + '</sup></span>';
        });
        html = html.replace(/\b([A-Za-z])\^([A-Za-z0-9]+)\b/g, function (_match, base, superscript) {
          return '<span class="inline-notation"><span>' + base + '</span><sup>' + superscript + '</sup></span>';
        });
        html = html.replace(/\b(theta|epsilon)\b/g, function (match, _word, offset, source) {
          if (offset > 0 && source.charAt(offset - 1) === "\\") {
            return match;
          }
          return '<span class="inline-notation inline-greek">' + (match.toLowerCase() === "theta" ? "θ" : "ε") + "</span>";
        });
        return html;
      }

      function renderInlineNotationInHTML(html) {
        let inCode = false;
        return safeText(html).split(/(<\/?code\b[^>]*>|<[^>]+>)/gi).map(function (part) {
          if (/^<code\b/i.test(part)) {
            inCode = true;
            return part;
          }
          if (/^<\/code>/i.test(part)) {
            inCode = false;
            return part;
          }
          if (part.charAt(0) === "<" || inCode) {
            return part;
          }
          return renderInlineNotationInEscapedText(part);
        }).join("");
      }

      function renderInlineNotationHTML(value) {
        return renderInlineNotationInHTML(escapeHTML(value));
      }

      function renderLatexFallbackHTML(value) {
        return renderInlineNotationHTML(normalizeLatexFallbackText(value));
      }

      function markdown(value) {
        let html = escapeHTML(value);
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        html = html.replace(/\n/g, "<br>");
        return renderInlineNotationInHTML(html);
      }

      function sortSlots(slots) {
        return [...(Array.isArray(slots) ? slots : [])].sort(function (left, right) {
          const rowDelta = numeric(left.r, 0) - numeric(right.r, 0);
          if (rowDelta !== 0) {
            return rowDelta;
          }
          const columnDelta = numeric(left.c, 0) - numeric(right.c, 0);
          if (columnDelta !== 0) {
            return columnDelta;
          }
          return safeText(left.slot_id).localeCompare(safeText(right.slot_id));
        });
      }

      function colorForToken(token, index) {
        const mapped = {
          accent_0: "var(--accent-0)",
          accent_1: "var(--accent-1)",
          accent_2: "var(--accent-2)",
          accent_3: "var(--accent-3)",
          lesson_0: "var(--accent-0)",
          lesson_1: "var(--accent-1)",
          lesson_2: "var(--accent-2)",
          lesson_3: "var(--accent-3)",
          info: "var(--accent-1)",
          warning: "var(--warning)"
        };
        const palette = [
          "var(--accent-0)",
          "var(--accent-1)",
          "var(--accent-2)",
          "var(--accent-3)"
        ];
        const key = nonEmptyString(token);
        return mapped[key] || palette[index % palette.length];
      }

      function modeLabel(mode) {
        const labels = {
          definition: "Definition",
          rule: "Rule",
          example: "Example",
          warning: "Warning",
          caption: "Caption",
          quote: "Quote",
          body: ""
        };
        return labels[mode] || "";
      }

      function buildIncomingConnectionMap(slots) {
        const incoming = new Map();
        slots.forEach(function (slot) {
          const props = slot.props || {};
          const target = nonEmptyString(props.connect_to_slot_id);
          if (!target) {
            return;
          }
          const existing = incoming.get(target) || [];
          existing.push(safeText(slot.slot_id));
          incoming.set(target, existing);
        });
        return incoming;
      }

      function setRecallPromptReveal(prompt, isRevealed) {
        prompt.classList.toggle("is-revealed", isRevealed);
        prompt.setAttribute("aria-expanded", isRevealed ? "true" : "false");

        const answerPanel = prompt.querySelector(".recall-answer-panel, .recall-focus-answer");
        if (answerPanel) {
          answerPanel.setAttribute("aria-hidden", isRevealed ? "false" : "true");
        }

        const hint = prompt.querySelector(".recall-reveal-hint, .recall-focus-hint");
        if (hint) {
          hint.textContent = isRevealed ? "Tap to hide" : "Tap to reveal";
        }
      }

      function toggleRecallPrompt(prompt) {
        if (!prompt || prompt.dataset.hasAnswer !== "true") {
          return;
        }
        setRecallPromptReveal(prompt, !prompt.classList.contains("is-revealed"));
      }

      const timelineEntranceTiming = {
        pointDelay: 0,
        dateDelay: 760,
        contentDelay: 1250,
        noteDelay: 1460,
        connectorDuration: 1500
      };
      const gridRevealTiming = {
        initialStartDelay: 260,
        interCellPause: 180,
        genericDuration: 1050,
        genericAnimationDuration: 760,
        keypointDuration: 1600,
        keypointAnimationDuration: 980,
        pairDuration: 2200,
        pairAnimationDuration: 1250,
        keyValueDuration: 2000,
        keyValueAnimationDuration: 1150,
        compareDuration: 2600,
        compareAnimationDuration: 1350,
        processDuration: 1800,
        processAnimationDuration: 1100,
        timelineDuration: 3900,
        timelineAnimationDuration: 1180,
        tripletDuration: 2500,
        tripletAnimationDuration: 1320,
        functionPlotDuration: 2600,
        functionPlotAnimationDuration: 1320,
        miniChartDuration: 2800,
        miniChartAnimationDuration: 1280,
        connectorDuration: 1100,
        supportDuration: 700
      };
      const gridRevealState = {
        runId: 0,
        hasPlayed: false,
        isRunning: false,
        isWaitingForGate: false,
        pendingShellCount: 0,
        pendingResizeRender: false,
        lastViewportWidth: 0
      };

      function isGridRevealGateOpen() {
        return window.__webGridcellRevealGateOpen !== false;
      }

      function renderDocument() {
        const scenarios = Array.isArray(documentPayload.scenarios) ? documentPayload.scenarios : [];
        const showScenarioTitles = !!documentPayload.showScenarioTitles;
        const isNarrow = window.innerWidth < 620;
        const revealGateOpen = isGridRevealGateOpen();
        const shouldHoldGridReveal = !gridRevealState.hasPlayed && !revealGateOpen;
        const shouldAnimateGridReveal = !gridRevealState.hasPlayed && revealGateOpen && !prefersReducedMotion;
        gridRevealState.runId += 1;
        const revealRunId = gridRevealState.runId;
        gridRevealState.lastViewportWidth = window.innerWidth;
        gridRevealState.pendingResizeRender = false;

        if (!scenarios.length) {
          rootNode.innerHTML = '<div class="cell-card">No grid scenarios available.</div>';
          gridRevealState.isRunning = false;
          gridRevealState.isWaitingForGate = false;
          gridRevealState.pendingShellCount = 0;
          return;
        }

        rootNode.innerHTML = "";
        const lessonStack = document.createElement("div");
        lessonStack.className = "lesson-stack";

        scenarios.forEach(function (scenario, scenarioIndex) {
          lessonStack.appendChild(renderScenario(scenario, showScenarioTitles, isNarrow, scenarioIndex));
        });

        rootNode.appendChild(lessonStack);
        if (typeof prepareMiniChartInteractions === "function") {
          prepareMiniChartInteractions(rootNode);
        }
        const shells = Array.from(rootNode.querySelectorAll(".grid-shell"));
        gridRevealState.isRunning = shouldAnimateGridReveal && shells.length > 0;
        gridRevealState.isWaitingForGate = shouldHoldGridReveal && shells.length > 0;
        gridRevealState.pendingShellCount = gridRevealState.isRunning ? shells.length : 0;
        if (shouldAnimateGridReveal) {
          gridRevealState.hasPlayed = true;
        }
        queueFlowConnectorRender(shouldAnimateGridReveal || shouldHoldGridReveal, function () {
          if (shouldHoldGridReveal) {
            return;
          }
          shells.forEach(function (shell) {
            runGridRevealSequence(shell, shouldAnimateGridReveal, revealRunId);
          });
        });
        if (!shouldAnimateGridReveal && !shouldHoldGridReveal) {
          gridRevealState.hasPlayed = true;
        }
      }

      function startGridRevealSequenceWhenReady() {
        window.__webGridcellRevealGateOpen = true;
        if (gridRevealState.hasPlayed || gridRevealState.isRunning) {
          return;
        }

        const shells = Array.from(rootNode.querySelectorAll(".grid-shell"));
        if (!shells.length) {
          renderDocument();
          return;
        }

        const shouldAnimateGridReveal = !prefersReducedMotion;
        gridRevealState.runId += 1;
        const revealRunId = gridRevealState.runId;
        gridRevealState.lastViewportWidth = window.innerWidth;
        gridRevealState.pendingResizeRender = false;
        gridRevealState.isWaitingForGate = false;
        gridRevealState.isRunning = shouldAnimateGridReveal && shells.length > 0;
        gridRevealState.pendingShellCount = gridRevealState.isRunning ? shells.length : 0;
        if (shouldAnimateGridReveal) {
          gridRevealState.hasPlayed = true;
        }

        queueFlowConnectorRender(shouldAnimateGridReveal, function () {
          shells.forEach(function (shell) {
            runGridRevealSequence(shell, shouldAnimateGridReveal, revealRunId);
          });
        });
        if (!shouldAnimateGridReveal) {
          gridRevealState.hasPlayed = true;
        }
      }

      window.startGridRevealSequenceWhenReady = startGridRevealSequenceWhenReady;

      function renderLessonGrid(payload) {
        documentPayload = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        const nextTheme = documentPayload.theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", nextTheme);
        const payloadNode = document.getElementById("grid-layout-data");
        if (payloadNode) {
          try {
            payloadNode.textContent = JSON.stringify(documentPayload).replace(/</g, "\\u003c");
          } catch (error) {
            payloadNode.textContent = "{}";
          }
        }
        if (typeof gridRevealState === "object" && gridRevealState !== null) {
          gridRevealState.runId += 1;
          gridRevealState.hasPlayed = false;
          gridRevealState.isRunning = false;
          gridRevealState.isWaitingForGate = false;
          gridRevealState.pendingShellCount = 0;
          gridRevealState.pendingResizeRender = false;
        }
        renderDocument();
      }

      window.renderLessonGrid = renderLessonGrid;

      function handleGridViewportResize() {
        const currentWidth = window.innerWidth;
        const previousWidth = numeric(gridRevealState.lastViewportWidth, currentWidth);
        const widthChanged = Math.abs(currentWidth - previousWidth) > 1;

        if (gridRevealState.isRunning) {
          if (widthChanged) {
            gridRevealState.pendingResizeRender = true;
          }
          renderFlowConnectorOverlays(true);
          return;
        }

        if (gridRevealState.isWaitingForGate) {
          if (widthChanged) {
            renderDocument();
          } else {
            renderFlowConnectorOverlays(true);
          }
          return;
        }

        if (!widthChanged) {
          renderFlowConnectorOverlays(false);
          return;
        }

        renderDocument();
      }

      function noteGridRevealShellComplete() {
        if (!gridRevealState.isRunning) {
          return;
        }
        gridRevealState.pendingShellCount = Math.max(0, gridRevealState.pendingShellCount - 1);
        if (gridRevealState.pendingShellCount > 0) {
          return;
        }

        gridRevealState.isRunning = false;
        gridRevealState.isWaitingForGate = false;
        gridRevealState.hasPlayed = true;
        if (gridRevealState.pendingResizeRender) {
          gridRevealState.pendingResizeRender = false;
          renderDocument();
        } else {
          renderFlowConnectorOverlays(false);
        }
      }

      function renderScenario(scenario, showScenarioTitles, isNarrow, scenarioIndex) {
        const shell = document.createElement("section");
        shell.className = "scenario-shell" + (showScenarioTitles ? " with-meta" : "");

        // if (showScenarioTitles) {
        //   const title = nonEmptyString(scenario.title);
        //   const subtitle = nonEmptyString(scenario.subtitle);
        //   const header = document.createElement("header");
        //   header.className = "scenario-meta";
        //   header.innerHTML =
        //     '<div class="scenario-overline">Web Grid Preview</div>' +
        //     '<h2 class="scenario-title">' + escapeHTML(title || "Untitled Scenario") + '</h2>' +
        //     (subtitle ? '<p class="scenario-subtitle">' + escapeHTML(subtitle) + "</p>" : "");
        //   shell.appendChild(header);
        // }

        // const screenExplanation = nonEmptyString(scenario.screenExplanation);
        // if (screenExplanation) {
        //   shell.appendChild(renderScreenExplanation(screenExplanation));
        // }

        shell.appendChild(renderGridShell(scenario, isNarrow, scenarioIndex));

        if (Array.isArray(scenario.supportingComponents) && scenario.supportingComponents.length) {
          shell.appendChild(renderSupportingComponents(scenario.supportingComponents));
        }

        return shell;
      }

      function renderGridShell(scenario, isNarrow, scenarioIndex) {
        const cols = Math.max(1, numeric((scenario.grid || {}).cols, 10));
        const scenarioScope = scenarioStyleKey(scenario, scenarioIndex);
        const shell = document.createElement("div");
        shell.className = "grid-shell " + (isNarrow ? "stacked" : "wide");
        shell.dataset.connectionMode = isNarrow ? "stacked" : "wide";
        shell.dataset.styleScope = scenarioScope;
        shell.style.setProperty("--grid-columns", String(cols));

        const slots = sortSlots(scenario.slots);
        const incomingConnections = buildIncomingConnectionMap(slots);
        const cellStyleOccurrences = new Map();
        const relationshipStyleOccurrences = new Map();
        const sharedTimelineStepStyle = selectedTimelineStepSectionStyle(slots, scenarioScope);

        function nextStyleOccurrence(counter, key) {
          const normalizedKey = safeText(key);
          const occurrence = counter.get(normalizedKey) || 0;
          counter.set(normalizedKey, occurrence + 1);
          return occurrence;
        }

        slots.forEach(function (slot) {
          const props = slot.props || {};
          const content = slot.content || {};
          const card = document.createElement("article");
          const cellType = safeText(slot.cell_type || slot.type);
          const renderMode = cellType === "TextCell"
            ? normalizedTextCellMode(props.render_mode)
            : "body";
          const hasOutgoingConnection = boolFlag(props.show_connector, true) && nonEmptyString(props.connect_to_slot_id);
          const hasIncomingConnection = boolFlag(props.show_connector, true) && (incomingConnections.get(safeText(slot.slot_id)) || []).length > 0;
          const slotId = safeText(slot.slot_id);
          const relationshipKind = relationshipCellKind(cellType);
          const cellStyleOccurrence = nextStyleOccurrence(cellStyleOccurrences, cellType);
          const relationshipStyleOccurrence = relationshipKind
            ? nextStyleOccurrence(relationshipStyleOccurrences, cellType)
            : 0;
          const relationshipAssignment = relationshipKind && isRandomizedStableUnlockedPolicy
            ? relationshipRenderAssignmentForSlot(cellType, slot, content, scenarioScope, relationshipStyleOccurrence)
            : null;
          const relationshipStyleMode = relationshipKind
            ? relationshipAssignment
              ? relationshipAssignment.relation
              : relationshipStyleModeForCell(cellType, props)
            : "";
          const relationshipRenderMode = relationshipKind
            ? relationshipAssignment
              ? relationshipAssignment.renderMode
              : relationshipRenderModeForCell(cellType, props)
            : "";
          const relationshipStyle = relationshipKind
            ? relationshipAssignment
              ? relationshipAssignment.style
              : selectedRelationshipCellStyle(cellType, relationshipStyleMode, scenarioScope, slot.preview_relationship_style, undefined, relationshipStyleOccurrence)
            : "";
          const cellStyleSubtype = styleSubtypeForCell(cellType, props, content);
          const previewCellStyle = safeText(slot.preview_cell_style);
          const cellStyle = cellType === "KeyPointsCell"
            ? selectedKeypointStyle(scenarioScope, previewCellStyle, cellStyleOccurrence)
            : cellType === "TimelineStepCell"
              ? sharedTimelineStepStyle
              : cellType === "KeyValueCell"
                ? selectedCellStyle(cellType, scenarioScope, cellStyleSubtype, undefined, previewCellStyle, cellStyleOccurrence)
                : selectedCellStyle(cellType, scenarioScope, cellStyleSubtype, undefined, previewCellStyle, cellStyleOccurrence);
          const textStyle = cellType === "TextCell"
            ? cellStyle
            : "";
          const relationshipClassPrefix = relationshipCellClassPrefix(relationshipKind);
          const relationshipClassNames = relationshipKind
            ? " relationship-mode-" + relationshipRenderMode +
              " relationship-style-mode-" + relationshipStyleMode +
              (relationshipStyle ? " relationship-style-" + relationshipStyle + " " + relationshipClassPrefix + "-style-" + relationshipStyle : "")
            : "";

          card.className =
            "cell-card " +
            classNameForCellType(cellType) +
            (cellStyle ? " cell-style-" + cellStyle : "") +
            (cellType === "TextCell" ? " text-mode-" + renderMode + " text-style-" + textStyle : "") +
            relationshipClassNames +
            (hasIncomingConnection ? " has-incoming-connection" : "") +
            (hasOutgoingConnection ? " has-outgoing-connection" : "") +
            " sequence-pending";
          card.dataset.slotId = slotId;
          card.dataset.cellType = cellType;
          card.dataset.cellStyle = cellStyle;
          card.dataset.cellStyleSubtype = cellStyleSubtype;
          card.dataset.cellStyleOccurrence = safeText(cellStyleOccurrence);
          card.dataset.cellStyleScope = scenarioScope;
          card.dataset.textRenderMode = renderMode;
          card.dataset.textStyle = textStyle;
          card.dataset.relationshipStyleMode = relationshipStyleMode;
          card.dataset.relationshipRenderMode = relationshipRenderMode;
          card.dataset.relationshipStyle = relationshipStyle;
          card.dataset.relationshipStyleOccurrence = safeText(relationshipStyleOccurrence);
          card.dataset.connectToSlotId = hasOutgoingConnection ? nonEmptyString(props.connect_to_slot_id) : "";
          card.dataset.sequenceIndex = safeText(props.sequence_index || "");
          card.dataset.showConnector = boolFlag(props.show_connector, true) ? "true" : "false";
          card.dataset.gridRow = safeText(numeric(slot.r, 0));
          card.dataset.gridColumn = safeText(numeric(slot.c, 0));
          card.dataset.sequenceState = "pending";
          card.dataset.animationProfile = animationProfileForCell(card).name;

          if (cellType === "KeyPointsCell") {
            card.style.setProperty("--keypoint-dot-delay", "80ms");
            card.style.setProperty("--keypoint-text-delay", "210ms");
          }

          if (!isNarrow) {
            const columnStart = numeric(slot.c, 0) + 1;
            const columnSpan = Math.max(1, numeric(slot.colspan, 1));
            const rowStart = numeric(slot.r, 0) + 1;
            const rowSpan = Math.max(1, numeric(slot.rowspan, 1));
            card.style.gridColumn = String(columnStart) + " / span " + String(columnSpan);
            card.style.gridRow = String(rowStart) + " / span " + String(rowSpan);
          }

          card.innerHTML = renderCell(slot, hasIncomingConnection, !!hasOutgoingConnection, relationshipStyle, cellStyle, relationshipAssignment);
          shell.appendChild(card);
        });

        return shell;
      }

      function classNameForCellType(cellType) {
        switch (cellType) {
          case "HeadingCell":
            return "heading-card";
          case "ImageCell":
            return "image-card";
          case "KeyPointsCell":
            return "keypoint-card";
          case "RecallPromptCell":
            return "recall-card";
          case "SpacerCell":
            return "spacer-card";
          case "CompareCell":
            return "compare-card";
          case "PairCell":
            return "pair-card";
          case "KeyValueCell":
            return "key-value-card";
          case "TripletCell":
            return "triplet-card";
          case "ProcessStepCell":
            return "process-card";
          case "TimelineStepCell":
            return "timeline-card";
          case "MiniChartCell":
            return "mini-chart-card";
          case "MathExpressionCell":
            return "math-expression-card";
          case "FunctionPlotCell":
            return "function-plot-card";
          case "CodeTraceCell":
            return "code-trace-card";
          case "MapRegionCell":
            return "map-region-card";
          default:
            return "";
        }
      }

      function renderCell(slot, hasIncomingConnection, hasOutgoingConnection, relationshipStyle, cellStyle, relationshipAssignment) {
        const cellType = safeText(slot.cell_type || slot.type);
        const content = slot.content || {};
        const props = slot.props || {};

        switch (cellType) {
          case "HeadingCell":
            return renderHeadingCell(content);
          case "TextCell":
            return renderTextCell(content, props);
          case "CompareCell":
            return renderCompareCell(content);
          case "PairCell":
            return renderPairCell(content, props, slot, relationshipStyle, relationshipAssignment);
          case "KeyValueCell":
            return renderKeyValueCell(content, props, relationshipAssignment);
          case "TripletCell":
            return renderTripletCell(content, props, slot, relationshipStyle, relationshipAssignment);
          case "ImageCell":
            return renderImageCell(content);
          case "KeyPointsCell":
            return renderKeyPointCell(content);
          case "RecallPromptCell":
            return renderRecallPromptCell(content, cellStyle);
          case "SpacerCell":
            return renderSpacerCell(content, slot);
          case "ProcessStepCell":
            return renderProcessStepCell(content, props, hasIncomingConnection, hasOutgoingConnection);
          case "TimelineStepCell":
            return renderTimelineStepCell(content, props, hasIncomingConnection, hasOutgoingConnection);
          case "MathExpressionCell":
            return renderMathExpressionCell(content);
          case "FunctionPlotCell":
            return renderFunctionPlotCell(content, props);
          case "MiniChartCell":
            return renderMiniChartCell(content, props);
          case "CodeTraceCell":
            return renderCodeTraceCell(content, props);
          case "MapRegionCell":
            return renderMapRegionCell(content, props);
          default:
            return '<p class="text-body">' + markdown(firstNonEmpty([content.text, content.body, content.body_markdown, cellType])) + "</p>";
        }
      }

      function animationProfileForCell(card) {
        switch (safeText(card.dataset.cellType)) {
          case "PairCell":
            return { name: "pair", duration: gridRevealTiming.pairDuration, animationDuration: gridRevealTiming.pairAnimationDuration };
          case "KeyValueCell":
            return { name: "key-value", duration: gridRevealTiming.keyValueDuration, animationDuration: gridRevealTiming.keyValueAnimationDuration };
          case "CompareCell":
            return { name: "compare", duration: gridRevealTiming.compareDuration, animationDuration: gridRevealTiming.compareAnimationDuration };
          case "ProcessStepCell":
            return { name: "process", duration: gridRevealTiming.processDuration, animationDuration: gridRevealTiming.processAnimationDuration };
          case "TimelineStepCell":
            return { name: "timeline", duration: gridRevealTiming.timelineDuration, animationDuration: gridRevealTiming.timelineAnimationDuration };
          case "TripletCell":
            return { name: "triplet", duration: gridRevealTiming.tripletDuration, animationDuration: gridRevealTiming.tripletAnimationDuration };
          case "FunctionPlotCell":
            return { name: "function-plot", duration: gridRevealTiming.functionPlotDuration, animationDuration: gridRevealTiming.functionPlotAnimationDuration };
          case "MiniChartCell":
            return { name: "mini-chart", duration: gridRevealTiming.miniChartDuration, animationDuration: gridRevealTiming.miniChartAnimationDuration };
          case "KeyPointsCell":
            return { name: "keypoint", duration: gridRevealTiming.keypointDuration, animationDuration: gridRevealTiming.keypointAnimationDuration };
          default:
            return { name: "generic", duration: gridRevealTiming.genericDuration, animationDuration: gridRevealTiming.genericAnimationDuration };
        }
      }

      function orderedCardsForReveal(shell) {
        const entries = Array.from(shell.querySelectorAll(".cell-card[data-slot-id]"))
          .map(function (card, index) {
            return {
              card: card,
              index: index,
              row: numeric(card.dataset.gridRow, 0),
              column: numeric(card.dataset.gridColumn, 0),
              sequence: numeric(card.dataset.sequenceIndex, 0),
              type: safeText(card.dataset.cellType),
              slotId: safeText(card.dataset.slotId)
            };
          })
          .sort(function (left, right) {
            if (left.row !== right.row) {
              return left.row - right.row;
            }
            if (left.column !== right.column) {
              return left.column - right.column;
            }
            return left.slotId.localeCompare(right.slotId) || left.index - right.index;
          });

        const orderedEntries = [];
        let index = 0;
        while (index < entries.length) {
          const entry = entries[index];
          const isChainCell = entry.sequence > 0 &&
            (entry.type === "ProcessStepCell" || entry.type === "TimelineStepCell");
          if (!isChainCell) {
            orderedEntries.push(entry);
            index += 1;
            continue;
          }

          const chainType = entry.type;
          const chainRun = [];
          while (
            index < entries.length &&
            entries[index].type === chainType &&
            entries[index].sequence > 0
          ) {
            chainRun.push(entries[index]);
            index += 1;
          }

          chainRun.sort(function (left, right) {
            if (left.sequence !== right.sequence) {
              return left.sequence - right.sequence;
            }
            if (left.row !== right.row) {
              return left.row - right.row;
            }
            if (left.column !== right.column) {
              return left.column - right.column;
            }
            return left.slotId.localeCompare(right.slotId) || left.index - right.index;
          });
          orderedEntries.push.apply(orderedEntries, chainRun);
        }

        return orderedEntries.map(function (entry, revealIndex) {
          entry.card.dataset.revealIndex = String(revealIndex);
          return entry.card;
        });
      }

      function activateSequencedCard(card) {
        const profile = animationProfileForCell(card);
        const animationDuration = Math.max(520, numeric(profile.animationDuration, profile.duration));
        card.dataset.animationProfile = profile.name;
        card.dataset.sequenceState = "active";
        card.style.setProperty("--grid-sequence-animation-duration", animationDuration + "ms");
        card.style.setProperty("--grid-cell-enter-duration", animationDuration + "ms");
        card.style.setProperty("--grid-cell-hold-duration", profile.duration + "ms");
        card.classList.remove("sequence-pending");
        card.classList.add("sequence-active");
        revealReadyConnectorLinksForCard(card);

        switch (profile.name) {
          case "pair":
            card.classList.add("pair-card-enter");
            card.style.setProperty("--pair-enter-delay", "0ms");
            break;
          case "compare":
            card.classList.add("compare-card-enter");
            card.style.setProperty("--compare-card-delay", "0ms");
            break;
          case "process":
            card.classList.add("process-card-enter");
            card.style.setProperty("--process-enter-delay", "0ms");
            break;
          case "timeline":
            card.classList.add("timeline-card-enter");
            card.style.setProperty("--timeline-point-delay", timelineEntranceTiming.pointDelay + "ms");
            card.style.setProperty("--timeline-date-delay", timelineEntranceTiming.dateDelay + "ms");
            card.style.setProperty("--timeline-content-delay", timelineEntranceTiming.contentDelay + "ms");
            card.style.setProperty("--timeline-note-delay", timelineEntranceTiming.noteDelay + "ms");
            break;
          case "triplet":
            card.classList.add("triplet-card-enter");
            card.style.setProperty("--triplet-card-delay", "0ms");
            break;
          case "key-value":
            card.classList.add("key-value-card-enter");
            break;
          case "mini-chart":
            card.classList.add("mini-chart-enter");
            break;
          default:
            break;
        }

        return profile;
      }

      function completeSequencedCard(card) {
        card.dataset.sequenceState = "complete";
        card.classList.remove("sequence-pending", "sequence-active");
        card.classList.remove("pair-card-enter", "compare-card-enter", "process-card-enter", "timeline-card-enter", "triplet-card-enter", "key-value-card-enter", "mini-chart-enter");
        card.classList.add("sequence-complete");
        revealReadyConnectorLinksForCard(card);
      }

      function completeAllSequencedCards(shell) {
        orderedCardsForReveal(shell).forEach(function (card) {
          card.dataset.sequenceState = "complete";
          card.classList.remove("sequence-pending", "sequence-active");
          card.classList.add("sequence-complete");
        });
        revealAllFlowConnectors(shell);
        revealScenarioSupport(shell, false);
      }

      function runGridRevealSequence(shell, shouldAnimate, runId) {
        const cards = orderedCardsForReveal(shell);
        if (!cards.length) {
          revealScenarioSupport(shell, shouldAnimate, shouldAnimate ? noteGridRevealShellComplete : null);
          return;
        }
        if (!shouldAnimate) {
          completeAllSequencedCards(shell);
          return;
        }

        let index = 0;
        function revealNext() {
          if (runId !== gridRevealState.runId) {
            return;
          }
          if (index >= cards.length) {
            revealScenarioSupport(shell, true, noteGridRevealShellComplete);
            return;
          }

          const card = cards[index];
          const profile = activateSequencedCard(card);
          window.setTimeout(function () {
            if (runId !== gridRevealState.runId) {
              return;
            }
            completeSequencedCard(card);
            index += 1;
            window.setTimeout(function () {
              if (runId !== gridRevealState.runId) {
                return;
              }
              window.requestAnimationFrame(revealNext);
            }, gridRevealTiming.interCellPause);
          }, profile.duration);
        }

        window.setTimeout(function () {
          if (runId !== gridRevealState.runId) {
            return;
          }
          window.requestAnimationFrame(revealNext);
        }, gridRevealTiming.initialStartDelay);
      }

      function revealScenarioSupport(shell, shouldAnimate, onComplete) {
        const scenario = shell.closest(".scenario-shell");
        const support = scenario ? scenario.querySelector(".support-stack") : null;
        if (!support) {
          if (typeof onComplete === "function") {
            onComplete();
          }
          return;
        }
        support.classList.remove("sequence-support-pending");
        if (!shouldAnimate) {
          support.classList.add("sequence-support-complete");
          if (typeof onComplete === "function") {
            onComplete();
          }
          return;
        }
        support.classList.add("sequence-support-active");
        window.setTimeout(function () {
          support.classList.remove("sequence-support-active");
          support.classList.add("sequence-support-complete");
          if (typeof onComplete === "function") {
            onComplete();
          }
        }, gridRevealTiming.supportDuration);
      }

      function revealReadyConnectorLinksForCard(card) {
        const shell = card.closest(".grid-shell");
        if (!shell) {
          return;
        }
        const slotId = safeText(card.dataset.slotId);
        const cardsBySlotId = new Map(Array.from(shell.querySelectorAll(".cell-card[data-slot-id]")).map(function (cardNode) {
          return [safeText(cardNode.dataset.slotId), cardNode];
        }));
        Array.from(shell.querySelectorAll(".flow-connector-pending")).forEach(function (path) {
          const sourceSlotId = safeText(path.dataset.sourceSlotId);
          const targetSlotId = safeText(path.dataset.targetSlotId);
          if (sourceSlotId !== slotId && targetSlotId !== slotId) {
            return;
          }
          const sourceCard = cardsBySlotId.get(sourceSlotId);
          const targetCard = cardsBySlotId.get(targetSlotId);
          const sourceComplete = sourceCard && sourceCard.dataset.sequenceState === "complete";
          const targetRevealed = targetCard && targetCard.dataset.sequenceState !== "pending";
          if (!sourceComplete || !targetRevealed) {
            return;
          }
          path.classList.remove("flow-connector-pending");
          path.classList.add("flow-connector-sequence-enter");
          const markerId = safeText(path.dataset.markerId);
          if (markerId) {
            path.setAttribute("marker-end", "url(#" + markerId + ")");
          }
          path.style.setProperty("--connector-delay", "0ms");
          path.style.setProperty("--connector-duration", gridRevealTiming.connectorDuration + "ms");
        });
      }

      function revealAllFlowConnectors(shell) {
        Array.from(shell.querySelectorAll(".flow-connector-pending")).forEach(function (path) {
          path.classList.remove("flow-connector-pending");
          const markerId = safeText(path.dataset.markerId);
          if (markerId) {
            path.setAttribute("marker-end", "url(#" + markerId + ")");
          }
        });
      }

      function queueFlowConnectorRender(animateConnectors, onRendered) {
        window.requestAnimationFrame(function () {
          renderFlowConnectorOverlays(!!animateConnectors);
          if (!animateConnectors) {
            window.requestAnimationFrame(function () {
              renderFlowConnectorOverlays(false);
              if (typeof onRendered === "function") {
                onRendered();
              }
            });
            window.setTimeout(function () {
              renderFlowConnectorOverlays(false);
            }, 180);
            return;
          }
          if (typeof onRendered === "function") {
            onRendered();
          }
        });
      }

      function renderFlowConnectorOverlays(animateConnectors) {
        const shells = Array.from(rootNode.querySelectorAll(".grid-shell"));
        shells.forEach(function (shell, shellIndex) {
          const existingLayer = shell.querySelector(".flow-connector-layer");
          if (existingLayer) {
            existingLayer.remove();
          }

          const cards = Array.from(shell.querySelectorAll(".cell-card[data-slot-id]"));
          const cardsBySlotId = new Map(cards.map(function (card) {
            return [safeText(card.dataset.slotId), card];
          }));
          const links = buildFlowConnectorLinks(cards, cardsBySlotId);

          if (!links.length) {
            return;
          }

          const shellRect = shell.getBoundingClientRect();
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("class", "flow-connector-layer");
          svg.setAttribute("width", String(shellRect.width));
          svg.setAttribute("height", String(shellRect.height));
          svg.setAttribute("viewBox", "0 0 " + shellRect.width + " " + shellRect.height);
          svg.setAttribute("aria-hidden", "true");

          const gradientId = "process-flow-gradient-" + shellIndex;
          const markerId = "process-flow-arrow-" + shellIndex;
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
          gradient.setAttribute("id", gradientId);
          gradient.setAttribute("x1", "0%");
          gradient.setAttribute("y1", "0%");
          gradient.setAttribute("x2", "100%");
          gradient.setAttribute("y2", "100%");
          [
            ["0%", "var(--accent-1)"],
            ["52%", "var(--accent-2)"],
            ["100%", "var(--accent-0)"]
          ].forEach(function (stopConfig) {
            const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop.setAttribute("offset", stopConfig[0]);
            stop.setAttribute("stop-color", stopConfig[1]);
            gradient.appendChild(stop);
          });
          defs.appendChild(gradient);
          const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
          marker.setAttribute("id", markerId);
          marker.setAttribute("viewBox", "0 0 10 10");
          marker.setAttribute("refX", "8");
          marker.setAttribute("refY", "5");
          marker.setAttribute("markerWidth", "5");
          marker.setAttribute("markerHeight", "5");
          marker.setAttribute("orient", "auto-start-reverse");
          const arrowhead = document.createElementNS("http://www.w3.org/2000/svg", "path");
          arrowhead.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
          arrowhead.setAttribute("class", "process-flow-arrowhead");
          marker.appendChild(arrowhead);
          defs.appendChild(marker);
          svg.appendChild(defs);

          links.forEach(function (link, index) {
            const sourcePoint = connectorPoint(shellRect, link.sourceCard, link.targetCard, true);
            const targetPoint = connectorPoint(shellRect, link.targetCard, link.sourceCard, false);
            const pathData = connectorPath(sourcePoint, targetPoint);
            const pathClass = link.sourceType === "TimelineStepCell" ? "timeline-flow-connector" : "process-flow-connector";
            const sourceComplete = link.sourceCard.dataset.sequenceState === "complete";
            const targetRevealed = link.targetCard.dataset.sequenceState !== "pending";
            const connectorReady = sourceComplete && targetRevealed;
            const pendingClass = animateConnectors && !connectorReady ? " flow-connector-pending" : "";

            const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("class", "flow-connector-glow " + pathClass + "-glow" + pendingClass);
            glowPath.setAttribute("data-source-slot-id", safeText(link.sourceCard.dataset.slotId));
            glowPath.setAttribute("data-target-slot-id", safeText(link.targetCard.dataset.slotId));
            glowPath.style.setProperty("--flow-index", String(index));
            glowPath.style.setProperty("--connector-delay", "0ms");
            glowPath.style.setProperty("--connector-duration", timelineEntranceTiming.connectorDuration + "ms");
            svg.appendChild(glowPath);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.setAttribute(
              "class",
              "flow-connector-path " + pathClass + pendingClass
            );
            path.setAttribute("data-source-slot-id", safeText(link.sourceCard.dataset.slotId));
            path.setAttribute("data-target-slot-id", safeText(link.targetCard.dataset.slotId));
            path.style.setProperty("--flow-index", String(index));
            path.style.setProperty("--connector-delay", "0ms");
            path.style.setProperty("--connector-duration", timelineEntranceTiming.connectorDuration + "ms");
            if (link.sourceType === "ProcessStepCell") {
              path.style.stroke = "url(#" + gradientId + ")";
              path.setAttribute("data-marker-id", markerId);
              if (!pendingClass) {
                path.setAttribute("marker-end", "url(#" + markerId + ")");
              }
            }
            svg.appendChild(path);
          });

          shell.insertBefore(svg, shell.firstChild);
          if (animateConnectors) {
            Array.from(svg.querySelectorAll(".flow-connector-path, .flow-connector-glow")).forEach(function (path) {
              try {
                const pathLength = Math.ceil(path.getTotalLength());
                path.style.setProperty("--path-length", String(pathLength));
              } catch (error) {
                path.style.setProperty("--path-length", "420");
              }
            });
          }
        });
      }

      function buildFlowConnectorLinks(cards, cardsBySlotId) {
        const links = [];
        const linkedSourceIds = new Set();
        const linkedTargetIds = new Set();

        cards.forEach(function (sourceCard) {
          const targetId = nonEmptyString(sourceCard.dataset.connectToSlotId);
          if (!targetId || sourceCard.dataset.showConnector === "false") {
            return;
          }
          const targetCard = cardsBySlotId.get(targetId);
          if (!targetCard || targetCard.dataset.showConnector === "false") {
            return;
          }
          const sourceType = safeText(sourceCard.dataset.cellType);
          const targetType = safeText(targetCard.dataset.cellType);
          if (sourceType !== "ProcessStepCell" && sourceType !== "TimelineStepCell") {
            return;
          }
          if (sourceType !== targetType) {
            return;
          }
          links.push({ sourceCard: sourceCard, targetCard: targetCard, sourceType: sourceType, explicit: true });
          linkedSourceIds.add(safeText(sourceCard.dataset.slotId));
          linkedTargetIds.add(safeText(targetCard.dataset.slotId));
        });

        const processCards = cards
          .filter(function (card) {
            return safeText(card.dataset.cellType) === "ProcessStepCell" && card.dataset.showConnector !== "false";
          })
          .map(function (card, index) {
            const rect = card.getBoundingClientRect();
            return {
              card: card,
              index: index,
              sequence: numeric(card.dataset.sequenceIndex, 0),
              top: rect.top,
              left: rect.left
            };
          })
          .filter(function (entry) {
            return entry.sequence > 0;
          })
          .sort(function (left, right) {
            if (left.sequence !== right.sequence) {
              return left.sequence - right.sequence;
            }
            if (left.top !== right.top) {
              return left.top - right.top;
            }
            if (left.left !== right.left) {
              return left.left - right.left;
            }
            return left.index - right.index;
          });

        processCards.forEach(function (entry, index) {
          if (index >= processCards.length - 1) {
            return;
          }
          const sourceId = safeText(entry.card.dataset.slotId);
          const targetId = safeText(processCards[index + 1].card.dataset.slotId);
          if (linkedSourceIds.has(sourceId) || linkedTargetIds.has(targetId)) {
            return;
          }
          links.push({
            sourceCard: entry.card,
            targetCard: processCards[index + 1].card,
            sourceType: "ProcessStepCell",
            explicit: false
          });
          linkedSourceIds.add(sourceId);
          linkedTargetIds.add(targetId);
        });

        const timelineCards = cards
          .filter(function (card) {
            return safeText(card.dataset.cellType) === "TimelineStepCell" && card.dataset.showConnector !== "false";
          })
          .map(function (card, index) {
            const rect = card.getBoundingClientRect();
            return {
              card: card,
              index: index,
              sequence: numeric(card.dataset.sequenceIndex, 0),
              top: rect.top,
              left: rect.left
            };
          })
          .sort(function (left, right) {
            if (left.sequence > 0 && right.sequence > 0 && left.sequence !== right.sequence) {
              return left.sequence - right.sequence;
            }
            if (left.top !== right.top) {
              return left.top - right.top;
            }
            if (left.left !== right.left) {
              return left.left - right.left;
            }
            return left.index - right.index;
          });

        timelineCards.forEach(function (entry, index) {
          if (index >= timelineCards.length - 1) {
            return;
          }
          const sourceId = safeText(entry.card.dataset.slotId);
          const targetId = safeText(timelineCards[index + 1].card.dataset.slotId);
          if (linkedSourceIds.has(sourceId) || linkedTargetIds.has(targetId)) {
            return;
          }
          links.push({
            sourceCard: entry.card,
            targetCard: timelineCards[index + 1].card,
            sourceType: "TimelineStepCell",
            explicit: false
          });
          linkedSourceIds.add(sourceId);
          linkedTargetIds.add(targetId);
        });

        return links;
      }

      function connectorPoint(shellRect, card, otherCard, isSource) {
        const node = card.querySelector(".process-node, .timeline-node");
        const rect = (node || card).getBoundingClientRect();
        const otherRect = (otherCard.querySelector(".process-node, .timeline-node") || otherCard).getBoundingClientRect();
        const centerX = rect.left - shellRect.left + rect.width / 2;
        const centerY = rect.top - shellRect.top + rect.height / 2;
        if (node) {
          const otherCenterX = otherRect.left - shellRect.left + otherRect.width / 2;
          const otherCenterY = otherRect.top - shellRect.top + otherRect.height / 2;
          const deltaX = otherCenterX - centerX;
          const deltaY = otherCenterY - centerY;

          if (Math.abs(deltaY) >= Math.abs(deltaX)) {
            return {
              x: centerX,
              y: centerY + (isSource ? Math.sign(deltaY || 1) : -Math.sign(deltaY || 1)) * rect.height / 2
            };
          }

          return {
            x: centerX + (isSource ? Math.sign(deltaX || 1) : -Math.sign(deltaX || 1)) * rect.width / 2,
            y: centerY
          };
        }
        return {
          x: isSource ? rect.right - shellRect.left : rect.left - shellRect.left,
          y: centerY
        };
      }

      function connectorPath(source, target) {
        const deltaX = target.x - source.x;
        const deltaY = target.y - source.y;
        const verticalFlow = Math.abs(deltaY) >= Math.abs(deltaX);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (Math.abs(deltaX) < 8 || (verticalFlow && Math.abs(deltaX) < 38)) {
          const bend = Math.min(Math.max(Math.abs(deltaY) * 0.34, 34), 120);
          const direction = deltaY >= 0 ? 1 : -1;
          return (
            "M " + source.x + " " + source.y +
            " C " + source.x + " " + (source.y + direction * bend) +
            ", " + target.x + " " + (target.y - direction * bend) +
            ", " + target.x + " " + target.y
          );
        }

        const radius = 16;
        if (verticalFlow) {
          const midY = source.y + deltaY * 0.5;
          const directionX = deltaX >= 0 ? 1 : -1;
          const directionY = deltaY >= 0 ? 1 : -1;
          const firstCornerY = midY - directionY * radius;
          const secondCornerY = midY + directionY * radius;
          return (
            "M " + source.x + " " + source.y +
            " L " + source.x + " " + firstCornerY +
            " Q " + source.x + " " + midY + " " + (source.x + directionX * radius) + " " + midY +
            " L " + (target.x - directionX * radius) + " " + midY +
            " Q " + target.x + " " + midY + " " + target.x + " " + secondCornerY +
            " L " + target.x + " " + target.y
          );
        }

        const bend = Math.min(Math.max(distance * 0.34, 44), 130);
        const c1x = source.x + (deltaX >= 0 ? bend : -bend);
        const c1y = source.y;
        const c2x = target.x - (deltaX >= 0 ? bend : -bend);
        const c2y = target.y;
        return "M " + source.x + " " + source.y + " C " + c1x + " " + c1y + ", " + c2x + " " + c2y + ", " + target.x + " " + target.y;
      }

      function renderScreenExplanation(text) {
        const wrapper = document.createElement("div");
        wrapper.className = "screen-explanation-card";
        wrapper.innerHTML =
          '<div class="eyebrow">Screen explanation</div>' +
          '<p class="screen-explanation-copy">' + markdown(text) + "</p>";
        return wrapper;
      }

      function renderSupportingComponents(components) {
        const wrapper = document.createElement("section");
        wrapper.className = "support-stack sequence-support-pending";
        components.forEach(function (component) {
          const type = safeText(component.type);
          const card = document.createElement("article");
          card.className = "support-card support-" + type.toLowerCase();
          card.innerHTML = renderSupportingComponent(component);
          wrapper.appendChild(card);
        });
        return wrapper;
      }

      function renderSupportingComponent(component) {
        const type = safeText(component.type);
        const content = component.content || {};
        const variant = nonEmptyString(component.variant) || "important";

        switch (type) {
          case "RecallPrompt":
            return renderRecallSupport(content);
          case "KeyPoints":
            return renderSupportingKeyPoints(content);
          case "Callout":
            return renderCalloutSupport(content, variant);
          case "CommonMistakes":
            return renderCommonMistakesSupport(content);
          case "ExampleAndRule":
            return renderExampleAndRuleSupport(content);
          default:
            return '<p class="text-body">' + markdown(firstNonEmpty([content.text, type])) + "</p>";
        }
      }

      function renderRecallSupport(content) {
        return (
          renderRecallPromptCell(content)
        );
      }

      function renderSupportingKeyPoints(content) {
        const points = Array.isArray(content.points) ? content.points : [];
        const fallback = firstNonEmpty([content.text, content.point, content.body_markdown, content.body]);
        const allPoints = points.length ? points : (fallback ? [fallback] : []);
        return (
          '<div class="support-label">Key points</div>' +
          allPoints.map(function (point) {
            return (
              '<div class="keypoint-row support-keypoint-row">' +
                '<span class="keypoint-dot"></span>' +
                '<div class="keypoint-text">' + markdown(point) + "</div>" +
              "</div>"
            );
          }).join("")
        );
      }

      function renderCalloutSupport(content, variant) {
        const labelMap = {
          definition: "Definition",
          pitfall: "Pitfall",
          intuition: "Intuition",
          important: "Important"
        };
        const text = firstNonEmpty([content.text, content.body_markdown, content.body]);
        return (
          '<div class="support-label">' + escapeHTML(labelMap[variant] || "Callout") + "</div>" +
          '<p class="callout-copy">' + markdown(text) + "</p>"
        );
      }

      function renderCommonMistakesSupport(content) {
        const mistakes = Array.isArray(content.mistakes) ? content.mistakes : [];
        return (
          '<div class="support-label">Common mistakes</div>' +
          mistakes.map(function (entry) {
            const mistake = firstNonEmpty([entry.mistake]);
            const correction = firstNonEmpty([entry.correction]);
            return (
              '<div class="mistake-entry">' +
                (mistake ? '<p class="mistake-copy"><strong>Mistake:</strong> ' + markdown(mistake) + "</p>" : "") +
                (correction ? '<p class="correction-copy"><strong>Correction:</strong> ' + markdown(correction) + "</p>" : "") +
              "</div>"
            );
          }).join("")
        );
      }

      function renderExampleAndRuleSupport(content) {
        const rule = firstNonEmpty([content.rule]);
        const example = firstNonEmpty([content.example]);
        const why = firstNonEmpty([content.why]);
        return (
          '<div class="support-label">Example and rule</div>' +
          (rule ? '<div class="example-rule-section"><div class="example-rule-title">Rule</div><p>' + markdown(rule) + "</p></div>" : "") +
          (example ? '<div class="example-rule-section"><div class="example-rule-title">Example</div><p>' + markdown(example) + "</p></div>" : "") +
          (why ? '<div class="example-rule-section"><div class="example-rule-title">Why</div><p>' + markdown(why) + "</p></div>" : "")
        );
      }

      function renderHeadingCell(content) {
        const heading = firstNonEmpty([content.heading, content.title, content.text, content.body]);
        return (
          '<div class="eyebrow">Lesson focus</div>' +
          '<h1 class="heading-value">' + escapeHTML(heading) + "</h1>"
        );
      }

      function renderImageCell(content) {
        const imageURL = firstNonEmpty([content.image_url]);
        const altText = firstNonEmpty([content.alt_text, content.caption, "Lesson image"]);
        const caption = firstNonEmpty([content.caption]);

        return (
          '<div class="image-frame">' +
            (imageURL
              ? '<img class="image-cell-photo" src="' + escapeHTML(imageURL) + '" alt="' + escapeHTML(altText) + '" loading="lazy" />'
              : '<div class="image-placeholder">Image unavailable</div>') +
          '</div>' +
          (caption ? '<p class="image-caption">' + escapeHTML(caption) + "</p>" : "")
        );
      }

      function renderTextCell(content, props) {
        const mode = normalizedTextCellMode(props.render_mode);
        const body = firstNonEmpty([
          content.orientation,
          content.body_markdown,
          content.body,
          content.text,
          content.definition,
          content.quote,
          content.rule,
          content.example,
          content.warning,
          content.caption
        ]);

        switch (mode) {
          case "orientation":
            return renderOrientationTextCell(content, body);
          case "definition":
            return renderDefinitionTextCell(content, body);
          case "quote":
            return renderQuoteTextCell(content, body);
          case "rule":
            return renderRuleTextCell(content, body);
          case "example":
            return renderExampleTextCell(content, body);
          case "warning":
            return renderWarningTextCell(content, body);
          case "caption":
            return renderCaptionTextCell(content, body);
          default:
            return renderBodyTextCell(content, props, body);
        }
      }

      function normalizedTextCellMode(value) {
        const mode = nonEmptyString(value) || "body";
        const supportedModes = ["orientation", "body", "definition", "quote", "rule", "example", "warning", "caption"];
        return supportedModes.includes(mode) ? mode : "body";
      }

      function textCellTitle(content) {
        return firstNonEmpty([
          content.term,
          content.title,
          content.heading,
          content.label,
          content.name
        ]);
      }

      function textCellParagraphs(value, className) {
        const text = safeText(value).trim();
        const blocks = text
          ? text.split(/\n{2,}/).map(function (block) { return block.trim(); }).filter(Boolean)
          : [""];
        return blocks.map(function (block) {
          return '<p class="' + className + '">' + markdown(block) + "</p>";
        }).join("");
      }

      function renderBodyTextCell(content, props, body) {
        const dropCap = boolFlag(content.drop_cap, false) || boolFlag(props.drop_cap, false);
        const columns = Math.max(1, Math.min(2, numeric(content.columns || props.columns, 1)));
        return (
          '<div class="text-cell text-cell-body' + (dropCap ? " has-dropcap" : "") + '" style="--text-columns: ' + columns + ';">' +
            '<div class="text-prose">' +
              textCellParagraphs(body, "text-paragraph text-body-editorial") +
            "</div>" +
          "</div>"
        );
      }

      function renderOrientationTextCell(content, body) {
        const orientation = firstNonEmpty([content.body_markdown, content.body, content.text, body]);
        return (
          '<div class="text-cell text-cell-orientation">' +
            '<div class="orientation-copy-wrap">' +
              textCellParagraphs(orientation, "text-paragraph orientation-copy") +
            "</div>" +
          "</div>"
        );
      }

      function renderDefinitionTextCell(content, body) {
        const title = textCellTitle(content);
        const definition = firstNonEmpty([content.definition, body]);
        return (
          '<div class="text-cell text-cell-definition">' +
            '<div class="definition-content">' +
              '<div class="text-cell-kicker">Definition</div>' +
              '<div class="definition-panel">' +
                (title ? '<h3 class="definition-term">' + markdown(title) + "</h3>" : "") +
                textCellParagraphs(definition, "text-paragraph definition-copy") +
              "</div>" +
            "</div>" +
          "</div>"
        );
      }

      function renderQuoteTextCell(content, body) {
        const quote = firstNonEmpty([content.quote, body]);
        const attribution = firstNonEmpty([content.attribution, content.source, content.author]);
        const context = firstNonEmpty([content.context, content.note, content.caption]);
        return (
          '<figure class="text-cell text-cell-quote">' +
            '<span class="quote-mark" aria-hidden="true">&ldquo;</span>' +
            '<blockquote class="quote-body">' +
              textCellParagraphs(quote, "text-paragraph quote-copy") +
            "</blockquote>" +
            (attribution ? '<figcaption class="quote-attribution">' + markdown(attribution) + "</figcaption>" : "") +
            (context ? '<div class="quote-context">' + markdown(context) + "</div>" : "") +
          "</figure>"
        );
      }

      function renderRuleTextCell(content, body) {
        const rule = firstNonEmpty([content.rule, body]);
        return (
          '<div class="text-cell text-cell-rule">' +
            '<div class="rule-header">' +
              '<span class="rule-icon text-stage text-stage-icon" aria-hidden="true"><span class="rule-icon-core"></span></span>' +
              '<span class="text-cell-kicker rule-kicker text-stage text-stage-kicker">Rule</span>' +
              '<span class="rule-header-line text-stage text-stage-frame" aria-hidden="true"></span>' +
            "</div>" +
            '<div class="rule-statement">' +
              '<span class="rule-anchor text-stage text-stage-icon" aria-hidden="true"></span>' +
              '<span class="rule-stamp-mark text-stage text-stage-icon" aria-hidden="true"></span>' +
              '<div class="rule-copy-wrap text-stage text-stage-body">' +
                textCellParagraphs(rule, "text-paragraph rule-copy text-stage-copy") +
              "</div>" +
            "</div>" +
          "</div>"
        );
      }

      function renderExampleTextCell(content, body) {
        const example = firstNonEmpty([content.example, body]);
        const title = firstNonEmpty([content.title, content.heading, content.label]) || "Example";
        return (
          '<div class="text-cell text-cell-example">' +
            '<div class="example-topline">' +
              '<span class="example-dot text-stage text-stage-icon" aria-hidden="true"></span>' +
              '<span class="text-cell-kicker example-kicker text-stage text-stage-kicker">Example</span>' +
              '<span class="example-title text-stage text-stage-title">' + escapeHTML(title) + "</span>" +
              '<span class="example-story-frames text-stage text-stage-frame" aria-hidden="true"><span></span><span></span><span></span></span>' +
            "</div>" +
            '<div class="example-stage text-stage text-stage-body">' +
              '<span class="example-proof-rail text-stage text-stage-frame" aria-hidden="true"></span>' +
              textCellParagraphs(example, "text-paragraph example-copy text-stage-copy") +
            "</div>" +
          "</div>"
        );
      }

      function renderWarningTextCell(content, body) {
        const warning = firstNonEmpty([content.warning, body]);
        return (
          '<div class="text-cell text-cell-warning">' +
            '<div class="warning-head">' +
              '<div class="warning-icon text-stage text-stage-icon" aria-hidden="true">!</div>' +
              '<div class="text-cell-kicker warning-kicker text-stage text-stage-kicker">Watch for</div>' +
            "</div>" +
            '<div class="warning-content text-stage text-stage-body">' +
              textCellParagraphs(warning, "text-paragraph warning-copy text-stage-copy") +
            "</div>" +
            '<span class="warning-ornament text-stage text-stage-frame" aria-hidden="true"></span>' +
          "</div>"
        );
      }

      function renderCaptionTextCell(content, body) {
        const caption = firstNonEmpty([content.caption, body]);
        return (
          '<figcaption class="text-cell text-cell-caption">' +
            '<span class="caption-rule text-stage text-stage-icon" aria-hidden="true"></span>' +
            '<span class="caption-label text-stage text-stage-kicker" aria-hidden="true">Caption</span>' +
            '<span class="caption-film-holes caption-film-top text-stage text-stage-frame" aria-hidden="true"></span>' +
            '<div class="caption-copy-wrap text-stage text-stage-body">' +
              textCellParagraphs(caption, "text-paragraph caption-copy text-stage-copy") +
            "</div>" +
            '<span class="caption-film-holes caption-film-bottom text-stage text-stage-frame" aria-hidden="true"></span>' +
          "</figcaption>"
        );
      }

      function renderCompareCell(content) {
        const title = firstNonEmpty([content.title, content.comparison_title]);
        const leftLabel = firstNonEmpty([content.left_label, content.leftLabel, content.left_title, "Left"]);
        const rightLabel = firstNonEmpty([content.right_label, content.rightLabel, content.right_title, "Right"]);
        const rows = (Array.isArray(content.rows) ? content.rows : []).filter(function (row) {
          return row && typeof row === "object";
        }).slice(0, 4);
        const takeaway = firstNonEmpty([content.takeaway, content.summary]);
        const comparisonLabel = "Comparison: " + leftLabel + " versus " + rightLabel;

        const rowHTML = rows.map(function (row, index) {
          const aspect = firstNonEmpty([row.aspect, row.label, row.dimension]);
          const left = firstNonEmpty([row.left, row.left_value, row.a]);
          const right = firstNonEmpty([row.right, row.right_value, row.b]);
          const rowDelay = 240 + index * 86;
          return (
            '<div class="compare-row" style="--compare-row-index: ' + index + '; --compare-row-delay: ' + rowDelay + 'ms;">' +
              '<div class="compare-aspect">' +
                '<span class="compare-aspect-index">' + escapeHTML(String(index + 1).padStart(2, "0")) + "</span>" +
                '<span class="compare-aspect-text">' + escapeHTML(aspect || "Contrast") + "</span>" +
              "</div>" +
              '<div class="compare-value compare-value-left"><div class="compare-value-inner">' + markdown(left) + "</div></div>" +
              '<div class="compare-axis" aria-hidden="true"><span></span></div>' +
              '<div class="compare-value compare-value-right"><div class="compare-value-inner">' + markdown(right) + "</div></div>" +
            "</div>"
          );
        }).join("");

        return (
          '<div class="compare-cell" role="group" aria-label="' + escapeHTML(comparisonLabel) + '" data-row-count="' + rows.length + '">' +
            (title ? '<div class="compare-title">' + escapeHTML(title) + "</div>" : "") +
            '<div class="compare-table">' +
              '<div class="compare-header">' +
                '<div class="compare-aspect-heading" aria-hidden="true">Aspect</div>' +
                '<div class="compare-label compare-label-left">' +
                  '<span class="compare-label-text">' + escapeHTML(leftLabel) + "</span>" +
                "</div>" +
                '<div class="compare-vs-badge" aria-hidden="true"><span>vs</span></div>' +
                '<div class="compare-label compare-label-right">' +
                  '<span class="compare-label-text">' + escapeHTML(rightLabel) + "</span>" +
                "</div>" +
              "</div>" +
              '<div class="compare-rows">' + (rowHTML || '<div class="compare-empty">Comparison rows unavailable.</div>') + "</div>" +
            "</div>" +
            (takeaway ? '<div class="compare-takeaway">' + markdown(takeaway) + "</div>" : "") +
          "</div>"
        );
      }

      function relationshipClassToken(value) {
        const token = safeText(value)
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return token || "default";
      }

      const pairRelationshipRoleExamples = {
        contrast: ["", ""],
        before_after: ["", ""],
        problem_solution: ["", ""],
        cause_effect: ["", ""],
        example_nonexample: ["", ""],
        claim_evidence: ["", ""],
        parallel_examples: ["", ""]
      };

      const tripletRelationshipRoleExamples = {
        cause_mechanism_effect: ["", "", ""],
        input_process_output: ["", "", ""],
        problem_method_result: ["", "", ""],
        claim_evidence_implication: ["", "", ""],
        trigger_response_outcome: ["", "", ""],
        before_change_after: ["", "", ""]
      };

      function relationshipRoleExamples(kind, relation) {
        const relationKey = safeText(relation).replace(/-/g, "_");
        if (kind === "pair") {
          return pairRelationshipRoleExamples[relationKey] || [];
        }
        if (kind === "triplet") {
          return tripletRelationshipRoleExamples[relationKey] || [];
        }
        return [];
      }

      const pairConnectorFallbacks = {
        contrast: "versus",
        before_after: "becomes",
        problem_solution: "handled by",
        cause_effect: "causes",
        example_nonexample: "not",
        claim_evidence: "supported by",
        parallel_examples: "same pattern"
      };

      const tripletConnectorFallbacks = {
        cause_mechanism_effect: ["through", "produces"],
        input_process_output: ["processed by", "outputs"],
        problem_method_result: ["handled by", "produces"],
        claim_evidence_implication: ["supported by", "implies"],
        trigger_response_outcome: ["triggers", "leads to"],
        before_change_after: ["changed by", "becomes"]
      };

      function pairLayoutMode(relation) {
        switch (safeText(relation).replace(/-/g, "_")) {
          case "cause_effect":
            return "directional-flow";
          case "problem_solution":
            return "resolution-flow";
          case "before_after":
            return "timeline-flow";
          case "example_nonexample":
            return "classification";
          case "claim_evidence":
            return "support";
          case "parallel_examples":
            return "mirror";
          default:
            return "divider-contrast";
        }
      }

      function pairRenderMode(relation) {
        switch (safeText(relation).replace(/-/g, "_")) {
          case "cause_effect":
          case "problem_solution":
          case "before_after":
            return "flowline";
          case "claim_evidence":
            return "support";
          case "parallel_examples":
            return "divider";
          case "example_nonexample":
            return "divider";
          case "contrast":
          default:
            return "divider";
        }
      }

      function tripletLayoutMode(relation) {
        switch (safeText(relation).replace(/-/g, "_")) {
          case "problem_method_result":
            return "solution-chain";
          case "cause_mechanism_effect":
            return "causal-chain";
          case "input_process_output":
            return "process-chain";
          case "claim_evidence_implication":
            return "reasoning-ladder";
          case "trigger_response_outcome":
            return "event-chain";
          case "before_change_after":
            return "transformation-chain";
          default:
            return "chain";
        }
      }

      function tripletRenderMode(relation, orientation) {
        const relationKey = safeText(relation).replace(/-/g, "_");
        if (relationKey === "claim_evidence_implication" && orientation !== "horizontal") {
          return "ladder";
        }
        return orientation === "horizontal" ? "chain-strip" : "vertical-rail";
      }

      function normalizedTripletRenderMode(value) {
        const mode = relationshipClassToken(value).replace(/_/g, "-");
        switch (mode) {
          case "chain-strip":
          case "vertical-rail":
          case "ladder":
            return mode;
          case "reasoning-ladder":
            return "ladder";
          default:
            return "";
        }
      }

      function relationshipBridgeKind(kind, relation) {
        const relationKey = safeText(relation).replace(/-/g, "_");
        if (kind === "pair") {
          if (relationKey === "claim_evidence") {
            return "support";
          }
          if (relationKey === "cause_effect" || relationKey === "problem_solution" || relationKey === "before_after") {
            return "arrow";
          }
          return "no-arrow";
        }
        if (kind === "triplet") {
          if (relationKey === "claim_evidence_implication") {
            return "support";
          }
          return "arrow";
        }
        return "no-arrow";
      }

      function relationshipRequestedOrientation(props) {
        const orientation = relationshipClassToken(firstNonEmpty([props && props.orientation, "auto"]));
        return orientation === "horizontal" || orientation === "vertical" ? orientation : "auto";
      }

      function relationshipViewportForcesVertical() {
        return typeof window !== "undefined" && numeric(window.innerWidth, 0) < 620;
      }

      function resolvePairOrientation(props, slot, relation, connectorLabel) {
        if (relationshipViewportForcesVertical()) {
          return "vertical";
        }
        const requested = relationshipRequestedOrientation(props);
        if (requested !== "auto") {
          return requested;
        }
        const relationKey = safeText(relation).replace(/-/g, "_");
        const colspan = numeric(slot && slot.colspan, 0);
        if (relationKey === "claim_evidence" || safeText(connectorLabel).length > 18) {
          return "vertical";
        }
        return colspan >= 8 ? "horizontal" : "vertical";
      }

      function estimateRelationshipTextLength(value) {
        if (!value) {
          return 0;
        }
        if (typeof value === "string") {
          return value.length;
        }
        if (Array.isArray(value)) {
          return value.reduce(function (total, item) {
            return total + estimateRelationshipTextLength(item);
          }, 0);
        }
        if (typeof value === "object") {
          return Object.keys(value).reduce(function (total, key) {
            return total + estimateRelationshipTextLength(value[key]);
          }, 0);
        }
        return safeText(value).length;
      }

      function resolveTripletOrientation(props, slot, content, relation) {
        return "vertical";
      }

      function relationshipHeaderHTML(chainLabel, relationshipSentence) {
        const chainLabelHTML = chainLabel
          ? '<div class="triplet-chain-label">' + escapeHTML(chainLabel) + "</div>"
          : "";
        const sentenceHTML = relationshipSentence
          ? '<div class="relationship-sentence">' + markdown(relationshipSentence) + "</div>"
          : "";
        if (!chainLabelHTML && !sentenceHTML) {
          return "";
        }
        return '<div class="relationship-header">' + chainLabelHTML + sentenceHTML + "</div>";
      }

      function relationshipRoleToken(value) {
        return relationshipClassToken(firstNonEmpty([value, "node"]));
      }

      function relationshipRoleHTML(role, label) {
        const roleText = firstNonEmpty([role]);
        if (!roleText || roleText.toLowerCase() === safeText(label).trim().toLowerCase()) {
          return "";
        }
        return '<div class="relationship-role">' + escapeHTML(roleText) + "</div>";
      }

      function relationshipNodeHTML(kind, payload, role, label, body, classes, indexLabel) {
        const indexHTML = kind !== "triplet" && indexLabel
          ? '<div class="triplet-index" aria-hidden="true">' + escapeHTML(indexLabel) + "</div>"
          : "";
        return (
          '<div class="relationship-node ' + kind + '-node ' + classes + ' role-' + relationshipRoleToken(role) + '">' +
            indexHTML +
            relationshipRoleHTML(role, label) +
            '<div class="relationship-label">' + escapeHTML(label) + "</div>" +
            (body ? '<div class="relationship-body">' + markdown(body) + "</div>" : "") +
          "</div>"
        );
      }

      function relationshipDetailText(payload) {
        if (!payload || typeof payload !== "object") {
          return "";
        }
        return firstNonEmpty([
          payload.body,
          payload.detail,
          payload.details,
          payload.subtext,
          payload.subtitle,
          payload.description,
          payload.explanation,
          payload.note,
          payload.text,
          payload.value
        ]);
      }

      function relationshipInlineNodeHTML(kind, role, label, classes, indexLabel, body) {
        const indexHTML = kind !== "triplet" && indexLabel
          ? '<div class="triplet-index" aria-hidden="true">' + escapeHTML(indexLabel) + "</div>"
          : "";
        const bodyHTML = body
          ? '<div class="relationship-body has-body">' + markdown(body) + "</div>"
          : "";
        return (
          '<div class="relationship-node relationship-inline-node ' + kind + '-node ' + classes + ' role-' + relationshipRoleToken(role) + '">' +
            indexHTML +
            relationshipRoleHTML(role, label) +
            '<div class="relationship-label">' + escapeHTML(label) + "</div>" +
            bodyHTML +
          "</div>"
        );
      }

      function relationshipBodyTextHTML(body, classes) {
        return body
          ? '<div class="relationship-body has-body ' + classes + '">' + markdown(body) + "</div>"
          : '<div class="relationship-body is-empty ' + classes + '"></div>';
      }

      function relationshipBridgeHTML(kind, label, bridgeKind, indexClass) {
        const labelText = firstNonEmpty([label]);
        return (
          '<div class="relationship-bridge ' + kind + '-connector ' + indexClass + ' bridge-' + bridgeKind + '" aria-hidden="true">' +
            '<span class="relationship-bridge-line relationship-bridge-line-start"></span>' +
            (labelText ? '<span class="relationship-bridge-label">' + escapeHTML(labelText) + "</span>" : "") +
            '<span class="relationship-bridge-line relationship-bridge-line-end"></span>' +
            (bridgeKind === "arrow" ? '<span class="relationship-arrow" aria-hidden="true"></span>' : "") +
            (bridgeKind === "support" ? '<span class="relationship-support-marker" aria-hidden="true"></span>' : "") +
          "</div>"
        );
      }

      function supportNodeHTML(role, label, body, classes, markerHTML) {
        const bodyHTML = body
          ? '<div class="relationship-body has-body support-node-body">' + markdown(body) + "</div>"
          : "";
        return (
          '<div class="relationship-node pair-node pair-panel support-node ' + classes + ' role-' + relationshipRoleToken(role) + '">' +
            (markerHTML || "") +
            '<div class="support-node-copy">' +
              relationshipRoleHTML(role, label) +
              '<div class="relationship-label support-node-label">' + escapeHTML(label) + "</div>" +
              bodyHTML +
            "</div>" +
          "</div>"
        );
      }

      function renderPairSupportBriefProof(leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, layoutMode) {
        const connectorText = firstNonEmpty([connectorLabel, "supported by"]);
        return (
          '<div class="pair-diagram relationship-diagram pair-support support-brief-proof orientation-vertical layout-' + layoutMode + '">' +
            '<div class="brief-proof-stack">' +
              '<span class="brief-proof-rule" aria-hidden="true"></span>' +
              supportNodeHTML(leftRole, leftLabel, leftBody, "pair-panel-left support-claim brief-proof-claim", '<span class="brief-proof-mark brief-proof-thesis-mark" aria-hidden="true"></span>') +
              '<div class="brief-proof-foundation">' +
                '<div class="relationship-bridge support-bridge brief-proof-bridge bridge-' + bridgeKind + '" aria-hidden="true">' +
                  '<span class="relationship-bridge-line relationship-bridge-line-start"></span>' +
                  '<span class="relationship-bridge-label">' + escapeHTML(connectorText) + "</span>" +
                  '<span class="relationship-bridge-line relationship-bridge-line-end"></span>' +
                  '<span class="relationship-support-marker" aria-hidden="true"></span>' +
                "</div>" +
                supportNodeHTML(rightRole, rightLabel, rightBody, "pair-panel-right support-evidence brief-proof-evidence", '<span class="brief-proof-mark brief-proof-evidence-mark" aria-hidden="true"></span>') +
                '<span class="brief-proof-seal" aria-hidden="true">proof</span>' +
              "</div>" +
            "</div>" +
          "</div>"
        );
      }

      function renderPairSupportCitationStack(leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, layoutMode) {
        const connectorText = firstNonEmpty([connectorLabel, "supported by"]);
        return (
          '<div class="pair-diagram relationship-diagram pair-support support-citation-stack orientation-vertical layout-' + layoutMode + '">' +
            '<div class="citation-stack-stage">' +
              '<div class="citation-evidence-stack">' +
                '<div class="citation-source-sheets" aria-hidden="true">' +
                  '<span class="citation-sheet citation-sheet-a"></span>' +
                  '<span class="citation-sheet citation-sheet-b"></span>' +
                "</div>" +
                supportNodeHTML(rightRole, rightLabel, rightBody, "pair-panel-right support-evidence citation-evidence", '<span class="citation-index" aria-hidden="true">01</span>') +
              "</div>" +
              '<div class="relationship-bridge support-bridge citation-bridge bridge-' + bridgeKind + '" aria-hidden="true">' +
                '<span class="relationship-bridge-line relationship-bridge-line-start"></span>' +
                '<span class="relationship-bridge-label">' + escapeHTML(connectorText) + "</span>" +
                '<span class="relationship-bridge-line relationship-bridge-line-end"></span>' +
                '<span class="relationship-support-marker" aria-hidden="true"></span>' +
              "</div>" +
              supportNodeHTML(leftRole, leftLabel, leftBody, "pair-panel-left support-claim citation-claim", '<span class="citation-pin" aria-hidden="true"></span>') +
            "</div>" +
          "</div>"
        );
      }

      function renderPairSupportArgumentLine(leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, layoutMode) {
        const connectorText = firstNonEmpty([connectorLabel, "supported by"]);
        return (
          '<div class="pair-diagram relationship-diagram pair-support support-argument-line orientation-vertical layout-' + layoutMode + '">' +
            '<div class="argument-line-stage">' +
              '<div class="argument-path" aria-hidden="true">' +
                '<span class="argument-path-line"></span>' +
                '<span class="argument-path-node argument-path-node-claim"></span>' +
                '<span class="argument-path-node argument-path-node-evidence"></span>' +
              "</div>" +
              supportNodeHTML(leftRole, leftLabel, leftBody, "pair-panel-left support-claim argument-claim", '<span class="argument-step argument-step-claim" aria-hidden="true">A</span>') +
              '<div class="relationship-bridge support-bridge argument-bridge bridge-' + bridgeKind + '" aria-hidden="true">' +
                '<span class="relationship-bridge-line relationship-bridge-line-start"></span>' +
                '<span class="relationship-bridge-label">' + escapeHTML(connectorText) + "</span>" +
                '<span class="relationship-bridge-line relationship-bridge-line-end"></span>' +
                '<span class="relationship-support-marker" aria-hidden="true"></span>' +
              "</div>" +
              supportNodeHTML(rightRole, rightLabel, rightBody, "pair-panel-right support-evidence argument-evidence", '<span class="argument-step argument-step-evidence" aria-hidden="true">B</span>') +
            "</div>" +
          "</div>"
        );
      }

      function renderPairFlowline(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode) {
        if (orientation === "vertical") {
          return (
            '<div class="pair-diagram relationship-diagram pair-flowline pair-vertical-flow orientation-vertical layout-' + layoutMode + '">' +
              '<div class="pair-flow-main pair-flow-main-vertical">' +
                relationshipInlineNodeHTML("pair", leftRole, leftLabel, "pair-panel pair-panel-left pair-flow-node pair-node-inline", "", leftBody) +
                relationshipBridgeHTML("pair", connectorLabel, bridgeKind, "pair-flow-connector") +
                relationshipInlineNodeHTML("pair", rightRole, rightLabel, "pair-panel pair-panel-right pair-flow-node pair-node-inline", "", rightBody) +
              "</div>" +
            "</div>"
          );
        }

        return (
          '<div class="pair-diagram relationship-diagram pair-flowline orientation-horizontal layout-' + layoutMode + '">' +
            '<div class="pair-flow-main">' +
              relationshipInlineNodeHTML("pair", leftRole, leftLabel, "pair-panel pair-panel-left pair-node-inline", "", leftBody) +
              relationshipBridgeHTML("pair", connectorLabel, bridgeKind, "pair-flow-connector") +
              relationshipInlineNodeHTML("pair", rightRole, rightLabel, "pair-panel pair-panel-right pair-node-inline", "", rightBody) +
            "</div>" +
          "</div>"
        );
      }

      function renderPairDivider(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode) {
        return (
          '<div class="pair-diagram relationship-diagram pair-divider orientation-' + orientation + ' layout-' + layoutMode + '">' +
            '<div class="pair-divider-main">' +
              relationshipInlineNodeHTML("pair", leftRole, leftLabel, "pair-panel pair-panel-left pair-side pair-side-left", "", leftBody) +
              '<div class="pair-divider-center">' +
                '<span class="divider-line divider-line-start" aria-hidden="true"></span>' +
                relationshipBridgeHTML("pair", connectorLabel, bridgeKind, "pair-divider-label") +
                '<span class="divider-line divider-line-end" aria-hidden="true"></span>' +
              "</div>" +
              relationshipInlineNodeHTML("pair", rightRole, rightLabel, "pair-panel pair-panel-right pair-side pair-side-right", "", rightBody) +
            "</div>" +
          "</div>"
        );
      }

      function renderPairSupport(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode, relationshipStyle) {
        switch (relationshipClassToken(relationshipStyle)) {
          case "brief-proof":
            return renderPairFlowline(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode);
          case "citation-stack":
            return renderPairSupportCitationStack(leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, layoutMode);
          case "argument-line":
            return renderPairSupportArgumentLine(leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, layoutMode);
          default:
            break;
        }
        return (
          '<div class="pair-diagram relationship-diagram pair-support orientation-vertical layout-' + layoutMode + '">' +
            '<div class="pair-flow-main pair-flow-main-vertical">' +
              relationshipInlineNodeHTML("pair", leftRole, leftLabel, "pair-panel pair-panel-left support-claim pair-node-inline", "", leftBody) +
              relationshipBridgeHTML("pair", connectorLabel, bridgeKind, "support-bridge") +
              relationshipInlineNodeHTML("pair", rightRole, rightLabel, "pair-panel pair-panel-right support-evidence pair-node-inline", "", rightBody) +
            "</div>" +
          "</div>"
        );
      }

      function renderPairCell(content, props, slot, relationshipStyle, relationshipAssignment) {
        const left = content.left && typeof content.left === "object" ? content.left : {};
        const right = content.right && typeof content.right === "object" ? content.right : {};
        const assignment = relationshipAssignment || null;
        const relation = relationshipClassToken(firstNonEmpty([assignment && assignment.relation, props.relation, "contrast"]));
        const tone = relationshipClassToken(firstNonEmpty([props.tone, "neutral"]));
        const roleExamples = relationshipRoleExamples("pair", relation);
        const leftRole = assignment ? firstNonEmpty([roleExamples[0], left.role]) : firstNonEmpty([left.role, roleExamples[0]]);
        const rightRole = assignment ? firstNonEmpty([roleExamples[1], right.role]) : firstNonEmpty([right.role, roleExamples[1]]);
        const leftLabel = firstNonEmpty([left.label]);
        const rightLabel = firstNonEmpty([right.label]);
        const leftBody = relationshipDetailText(left);
        const rightBody = relationshipDetailText(right);
        const connectorLabel = assignment
          ? firstNonEmpty([pairConnectorFallbacks[relation], content.connector_label])
          : firstNonEmpty([content.connector_label, pairConnectorFallbacks[relation]]);
        const relationshipSentence = firstNonEmpty([content.relationship_sentence, content.relationship_summary, content.summary]);
        const headerHTML = relationshipHeaderHTML("", relationshipSentence);
        const layoutMode = pairLayoutMode(relation);
        const renderMode = pairRenderMode(relation);
        const orientation = resolvePairOrientation(props, slot, relation, connectorLabel);
        const bridgeKind = relationshipBridgeKind("pair", relation);
        const diagramHTML = renderMode === "support"
          ? renderPairSupport(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode, relationshipStyle)
          : renderMode === "flowline"
            ? renderPairFlowline(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode)
            : renderPairDivider(left, right, leftRole, rightRole, leftLabel, rightLabel, leftBody, rightBody, connectorLabel, bridgeKind, orientation, layoutMode);

        return (
          '<div class="relationship-cell pair-cell relation-' + relation + ' orientation-' + orientation + ' layout-' + layoutMode + ' pair-mode-' + renderMode + ' tone-' + tone + ' bridge-' + bridgeKind + '" role="group" aria-label="' + escapeHTML(leftLabel + " and " + rightLabel) + '">' +
            headerHTML +
            diagramHTML +
          "</div>"
        );
      }

      function renderKeyValueCell(content, props, relationshipAssignment) {
        const items = (Array.isArray(content.items) ? content.items : []).filter(function (item) {
          return item && typeof item === "object";
        }).slice(0, 6);
        const assignment = relationshipAssignment || null;
        const density = relationshipClassToken(firstNonEmpty([props.density, "normal"]));
        const tone = relationshipClassToken(firstNonEmpty([assignment && assignment.relation, props.tone, "neutral"]));
        const title = firstNonEmpty([content.title, content.heading, content.label]);
        const titleHTML = title
          ? '<div class="key-value-title">' +
              '<span class="key-value-title-marker" aria-hidden="true"></span>' +
              '<span class="key-value-title-text">' + escapeHTML(title) + "</span>" +
            "</div>"
          : "";

        const rows = items.map(function (item) {
          const key = firstNonEmpty([item.key, item.label, "Fact"]);
          const value = firstNonEmpty([item.value, item.body, item.text]);
          return { key: key, value: value };
        });
        const longestKeyLength = rows.reduce(function (longest, row) {
          return Math.max(longest, Array.from(safeText(row.key)).length);
        }, 0);
        const keyColumnCh = Math.min(Math.max(longestKeyLength + 2, 9), 22);
        const keyColumnStyle = "--kv-key-column: clamp(96px, " + keyColumnCh + "ch, 46%);";

        const rowHTML = rows.map(function (row, index) {
          const key = row.key;
          const value = row.value;
          return (
            '<div class="key-value-row" style="--kv-row-index: ' + index + ';">' +
              '<div class="key-value-key">' + escapeHTML(key) + "</div>" +
              '<div class="key-value-value">' + markdown(value) + "</div>" +
            "</div>"
          );
        }).join("");

        return (
          '<div class="key-value-cell density-' + density + ' tone-' + tone + '" style="' + keyColumnStyle + '" role="list">' +
            titleHTML +
            (rowHTML || '<div class="key-value-empty">Fact rows unavailable.</div>') +
          "</div>"
        );
      }

      function tripletNodeData(rawItems, roleExamples, connectorLabels, fallbackConnectors, emphasisIndex, preferRelationshipDefaults) {
        return rawItems.map(function (item, index) {
          const role = preferRelationshipDefaults
            ? firstNonEmpty([roleExamples[index], item.role])
            : firstNonEmpty([item.role, roleExamples[index]]);
          const label = firstNonEmpty([item.label, role, "Part " + String(index + 1)]);
          const body = relationshipDetailText(item);
          const connectorLabel = preferRelationshipDefaults
            ? firstNonEmpty([fallbackConnectors[index], connectorLabels[index], "then"])
            : firstNonEmpty([connectorLabels[index], fallbackConnectors[index], "then"]);
          return {
            item: item,
            role: role,
            label: label,
            body: body,
            connectorLabel: connectorLabel,
            emphasisClass: index === emphasisIndex ? " is-emphasis" : "",
            indexLabel: "",
            ordinal: String(index + 1)
          };
        });
      }

      function tripletChainTreatment(relationshipStyle) {
        switch (relationshipClassToken(relationshipStyle)) {
          case "domino-flow":
          case "pipeline":
          case "solve-path":
          case "evidence-rail":
          case "pulse-chain":
          case "time-slice":
            return "path-waypoint";
          case "mechanism-bridge":
          case "machine-flow":
          case "method-card":
          case "logic-ladder":
          case "signal-response":
          case "change-bridge":
            return "glass-flow";
          case "ripple-chain":
          case "transformer":
          case "outcome-lift":
          case "inference-cascade":
          case "reaction-path":
          case "then-now":
            return "layered-lift";
          default:
            return "path-waypoint";
        }
      }

      function tripletChainDecorHTML(treatment) {
        if (treatment === "glass-flow") {
          return '<div class="triplet-chain-decor triplet-chain-flow-tube" aria-hidden="true"><span></span></div>';
        }
        if (treatment === "layered-lift") {
          return '<div class="triplet-chain-decor triplet-chain-layer-stack" aria-hidden="true"><span></span><span></span></div>';
        }
        return '<div class="triplet-chain-decor triplet-chain-route" aria-hidden="true"><span></span></div>';
      }

      function renderTripletChainStrip(nodes, bridgeKind, layoutMode, orientation, relationshipStyle) {
        const treatment = tripletChainTreatment(relationshipStyle);
        const mainHTML = nodes.map(function (node, index) {
          const connector = index < 2
            ? relationshipBridgeHTML("triplet", node.connectorLabel, bridgeKind, "triplet-connector-" + String(index + 1) + " triplet-chain-connector triplet-chain-connector-" + String(index + 1))
            : "";
          return (
            relationshipInlineNodeHTML("triplet", node.role, node.label, "triplet-item triplet-item-" + node.ordinal + " triplet-segment triplet-chain-node" + node.emphasisClass, "", node.body) +
            connector
          );
        }).join("");

        return (
          '<div class="triplet-rail relationship-diagram triplet-chain-strip orientation-' + orientation + ' layout-' + layoutMode + ' triplet-chain-treatment-' + treatment + '">' +
            tripletChainDecorHTML(treatment) +
            '<div class="triplet-chain-main">' + mainHTML + "</div>" +
          "</div>"
        );
      }

      function renderTripletVerticalRail(nodes, bridgeKind, layoutMode, orientation) {
        const railHTML = nodes.map(function (node, index) {
          const connector = index < 2
            ? relationshipBridgeHTML("triplet", node.connectorLabel, bridgeKind, "triplet-connector-" + String(index + 1) + " triplet-rail-connector")
            : "";
          return (
            '<div style="--triplet-index: ' + index + '; --triplet-connector-index: ' + index + ';">' +
            relationshipInlineNodeHTML("triplet", node.role, node.label, "triplet-item triplet-item-" + node.ordinal + " triplet-rail-node" + node.emphasisClass, "", node.body) +
            connector +
            "</div>"
          );
        }).join("");

        return (
          '<div class="triplet-rail relationship-diagram triplet-vertical-rail orientation-' + orientation + ' layout-' + layoutMode + '">' +
            '<div class="triplet-main-flow">' + railHTML + "</div>" +
          "</div>"
        );
      }

      function renderTripletLadder(nodes, bridgeKind, layoutMode, orientation) {
        const ladderHTML = nodes.map(function (node, index) {
          const connector = index < 2
            ? relationshipBridgeHTML("triplet", node.connectorLabel, bridgeKind, "triplet-connector-" + String(index + 1) + " ladder-link")
            : "";
          return (
            relationshipInlineNodeHTML("triplet", node.role, node.label, "triplet-item triplet-item-" + node.ordinal + " ladder-step" + node.emphasisClass, "", node.body) +
            connector
          );
        }).join("");

        return (
          '<div class="triplet-rail relationship-diagram triplet-ladder orientation-' + orientation + ' layout-' + layoutMode + '">' +
            '<div class="triplet-main-flow">' + ladderHTML + "</div>" +
          "</div>"
        );
      }

      function renderTripletCell(content, props, slot, relationshipStyle, tripletRenderAssignment) {
        const rawItems = Array.isArray(content.items) ? content.items : [];
        const items = rawItems.filter(function (item) {
          return item && typeof item === "object";
        }).slice(0, 3);
        const connectorLabels = Array.isArray(content.connector_labels) ? content.connector_labels : [];
        const assignment = tripletRenderAssignment || null;
        const relation = relationshipClassToken(firstNonEmpty([assignment && assignment.relation, props.relation, "cause_mechanism_effect"]));
        const orientation = assignment
          ? relationshipClassToken(firstNonEmpty([assignment.orientation, "vertical"]))
          : resolveTripletOrientation(props, slot, content, relation);
        const tone = relationshipClassToken(firstNonEmpty([props.tone, "neutral"]));
        const roleExamples = relationshipRoleExamples("triplet", relation);
        const explicitEmphasisIndex = props && props.emphasis_index !== undefined ? numeric(props.emphasis_index, -1) : -1;
        const emphasisIndex = explicitEmphasisIndex >= 0 && explicitEmphasisIndex <= 2 ? explicitEmphasisIndex : 1;
        const chainLabel = firstNonEmpty([content.chain_label, content.title, content.heading]);
        const relationshipSentence = firstNonEmpty([content.relationship_sentence, content.relationship_summary, content.summary]);
        const headerHTML = relationshipHeaderHTML(chainLabel, relationshipSentence);
        const layoutMode = tripletLayoutMode(relation);
        const requestedRenderMode = assignment
          ? ""
          : normalizedTripletRenderMode(firstNonEmpty([props.render_mode, props.triplet_render_mode]));
        const renderMode = assignment
          ? firstNonEmpty([assignment.renderMode, tripletRenderMode(relation, orientation)])
          : firstNonEmpty([requestedRenderMode, tripletRenderMode(relation, orientation)]);
        const bridgeKind = relationshipBridgeKind("triplet", relation);
        const fallbackConnectors = tripletConnectorFallbacks[relation] || ["then", "then"];
        const nodes = tripletNodeData(items, roleExamples, connectorLabels, fallbackConnectors, emphasisIndex, !!assignment);
        const diagramHTML = nodes.length
          ? renderMode === "ladder"
            ? renderTripletLadder(nodes, bridgeKind, layoutMode, orientation)
            : renderMode === "chain-strip"
              ? renderTripletChainStrip(nodes, bridgeKind, layoutMode, orientation, relationshipStyle)
              : renderTripletVerticalRail(nodes, bridgeKind, layoutMode, orientation)
          : '<div class="triplet-rail relationship-diagram triplet-vertical-rail orientation-vertical layout-' + layoutMode + '"><div class="relationship-empty">Triplet content unavailable.</div></div>';

        return (
          '<div class="relationship-cell triplet-cell relation-' + relation + ' orientation-' + orientation + ' layout-' + layoutMode + ' triplet-mode-' + renderMode + (renderMode === "chain-strip" ? " triplet-chain-treatment-" + tripletChainTreatment(relationshipStyle) : "") + ' tone-' + tone + ' bridge-' + bridgeKind + '" role="group">' +
            headerHTML +
            diagramHTML +
          "</div>"
        );
      }

      function renderKeyPointCell(content) {
        const text = firstNonEmpty([
          content.text,
          content.point,
          content.body_markdown,
          content.body,
          Array.isArray(content.points) ? content.points[0] : ""
        ]);
        return (
          '<div class="keypoint-row grid-keypoint-row">' +
            '<span class="keypoint-dot grid-keypoint-dot" aria-hidden="true"></span>' +
            '<div class="keypoint-text grid-keypoint-text">' + markdown(text) + "</div>" +
          "</div>"
        );
      }

      function renderRecallPromptCell(content, style) {
        const question = firstNonEmpty([content.question, content.prompt]);
        const answer = firstNonEmpty([content.answer]);
        const hasAnswer = !!answer;
        if (style === "focus-lens") {
          return (
            '<div class="recall-focus-lens" data-recall-prompt="true" role="button" tabindex="' + (hasAnswer ? "0" : "-1") + '" aria-expanded="false" data-has-answer="' + (hasAnswer ? "true" : "false") + '">' +
              '<div class="recall-focus-question-layer">' +
                '<p class="recall-focus-question">' + markdown(question) + "</p>" +
              "</div>" +
              '<div class="recall-focus-answer" aria-hidden="true">' +
                '<p class="recall-focus-answer-copy">' + markdown(answer || "No answer provided.") + "</p>" +
                (hasAnswer ? '<span class="recall-focus-hint">Tap to reveal</span>' : "") +
              "</div>" +
            "</div>"
          );
        }
        return (
          '<div class="recall-peel" data-recall-prompt="true" role="button" tabindex="' + (hasAnswer ? "0" : "-1") + '" aria-expanded="false" data-has-answer="' + (hasAnswer ? "true" : "false") + '">' +
            '<div class="recall-answer-panel" aria-hidden="true">' +
              '<span class="recall-answer-label">Answer</span>' +
              '<p class="recall-answer-copy">' + markdown(answer || "No answer provided.") + "</p>" +
            "</div>" +
            '<div class="recall-cover">' +
              '<p class="recall-question">' + markdown(question) + "</p>" +
              (hasAnswer ? '<div class="recall-reveal-hint">Tap to reveal</div>' : "") +
              '<span class="recall-peel-edge" aria-hidden="true"></span>' +
            "</div>" +
          "</div>"
        );
      }

      function renderSpacerCell(content, slot) {
        const label = firstNonEmpty([content.label, content.text]);
        if (!label) {
          return '<div class="spacer-fill" aria-hidden="true"></div>';
        }
        return (
          '<div class="spacer-fill spacer-fill-labeled">' +
            '<span class="spacer-label">' + escapeHTML(label) + "</span>" +
          "</div>"
        );
      }

      function renderProcessStepCell(content, props, hasIncomingConnection, hasOutgoingConnection) {
        const action = firstNonEmpty([content.action]);
        const output = firstNonEmpty([content.output]);
        const note = firstNonEmpty([content.note]);
        const showNumberBadge = boolFlag(props.show_number_badge, true);
        const showArrowHint = boolFlag(props.show_arrow_hint, true);
        const sequenceIndex = numeric(props.sequence_index, 0);
        const chainLabel = !hasIncomingConnection ? firstNonEmpty([content.chain_label]) : "";
        const stepLabel = sequenceIndex > 0 && sequenceIndex < 10
          ? "0" + sequenceIndex
          : safeText(sequenceIndex || "");
        const nodeStateClass =
          (hasIncomingConnection ? " has-incoming-node" : "") +
          (hasOutgoingConnection ? " has-outgoing-node" : "");

        return (
          (chainLabel ? '<div class="chain-label process-chain-label">' + escapeHTML(chainLabel) + "</div>" : "") +
          '<div class="process-step-layout' + (showNumberBadge ? "" : " process-no-node") + '">' +
            (showNumberBadge
              ? '<div class="process-node-wrap' + nodeStateClass + '">' +
                  '<span class="process-node-glow"></span>' +
                  '<div class="process-node"><span>' + escapeHTML(stepLabel) + "</span></div>" +
                "</div>"
              : "") +
            '<div class="process-content">' +
              '<p class="process-action">' + markdown(action) + "</p>" +
              (output
                ? '<div class="process-result">' +
                    (showArrowHint ? '<span class="process-result-icon">&rarr;</span>' : "") +
                    '<span>' + markdown(output) + "</span>" +
                  "</div>"
                : "") +
              (note ? '<p class="process-note">' + markdown(note) + "</p>" : "") +
            "</div>" +
          "</div>"
        );
      }

      function renderTimelineStepCell(content, props, hasIncomingConnection, hasOutgoingConnection) {
        const eventTitle = firstNonEmpty([content.event_title, content.title, content.heading, content.when]);
        const timeLabel = firstNonEmpty([content.time_label]);
        const description = firstNonEmpty([content.description, content.what, content.body, content.text]);
        const note = firstNonEmpty([content.note]);
        const chainLabel = !hasIncomingConnection ? firstNonEmpty([content.chain_label]) : "";
        const showDateBadge = boolFlag(props.show_date_badge, true);
        const nodeStateClass =
          (hasIncomingConnection ? " has-incoming-node" : "") +
          (hasOutgoingConnection ? " has-outgoing-node" : "");

        return (
          (chainLabel ? '<div class="chain-label timeline-chain-label">' + escapeHTML(chainLabel) + "</div>" : "") +
          '<div class="timeline-step-layout">' +
            '<div class="timeline-rail-wrap' + nodeStateClass + '">' +
              '<span class="timeline-node-glow"></span>' +
              '<span class="timeline-node"></span>' +
            "</div>" +
            '<div class="timeline-content">' +
              (showDateBadge && timeLabel ? '<div class="timeline-topline"><span class="timeline-date-chip">' + escapeHTML(timeLabel) + "</span></div>" : "") +
              (eventTitle ? '<p class="timeline-event timeline-title">' + markdown(eventTitle) + "</p>" : "") +
              (description ? '<p class="timeline-description">' + markdown(description) + "</p>" : "") +
              (note ? '<p class="timeline-note">' + markdown(note) + "</p>" : "") +
            "</div>" +
          "</div>"
        );
      }

      function formulaSizeClass(expression, variables) {
        const length = safeText(expression).length;
        if (length > 76) {
          return "formula-size-dense";
        }
        if (length > 46 || variables.length > 4) {
          return "formula-size-long";
        }
        return "formula-size-compact";
      }

      function normalizeMathLatexSource(value) {
        const source = safeText(value).trim();
        if (!source) {
          return "";
        }
        return source
          .replace(/(^|[^\\])\bln\s*\(/g, "$1\\ln(")
          .replace(/\b([A-Za-z])_([A-Za-z0-9]{2,})\b/g, "$1_{$2}");
      }

      function renderFormulaExpressionHTML(expression) {
        const source = safeText(expression);
        const latexSource = normalizeMathLatexSource(source);
        if (!source) {
          return "";
        }
        if (window.katex && typeof window.katex.renderToString === "function") {
          try {
            return window.katex.renderToString(latexSource, {
              displayMode: true,
              throwOnError: true,
              strict: "ignore",
              trust: false
            });
          } catch (_error) {
            return '<span class="latex-fallback">' + renderLatexFallbackHTML(source) + "</span>";
          }
        }
        return '<span class="latex-fallback">' + renderLatexFallbackHTML(source) + "</span>";
      }

      function renderVariableSymbolHTML(symbol) {
        const source = safeText(symbol);
        const latexSource = normalizeMathLatexSource(source);
        if (!source) {
          return "";
        }
        if (window.katex && typeof window.katex.renderToString === "function") {
          try {
            return window.katex.renderToString(latexSource, {
              displayMode: false,
              throwOnError: true,
              strict: "ignore",
              trust: false
            });
          } catch (_error) {
            return renderLatexFallbackHTML(source);
          }
        }
        return renderLatexFallbackHTML(source);
      }

      function renderMathExpressionCell(content) {
        const expression = firstNonEmpty([content.expression]);
        const explanation = firstNonEmpty([content.explanation]);
        const variables = Array.isArray(content.variables) ? content.variables : [];
        const sizeClass = formulaSizeClass(expression, variables);
        const variableCountClass = variables.length ? " has-variable-legend" : " no-variable-legend";

        return (
          '<div class="math-expression-content ' + sizeClass + variableCountClass + '" style="--math-variable-count: ' + variables.length + '">' +
            '<div class="math-expression-topline">' +
              '<div class="eyebrow math-expression-label">Math expression</div>' +
              '<div class="formula-sparkline" aria-hidden="true"><span></span><span></span><span></span></div>' +
            "</div>" +
            '<div class="formula-stage">' +
              '<div class="formula-expression" aria-label="' + escapeHTML(expression) + '">' + renderFormulaExpressionHTML(expression) + "</div>" +
              '<div class="formula-rule" aria-hidden="true"></div>' +
            "</div>" +
            (explanation ? '<p class="formula-explanation">' + markdown(explanation) + "</p>" : "") +
            (variables.length
              ? '<div class="variable-list">' + variables.map(function (variable, index) {
                  const delay = 560 + index * 86;
                  const symbol = firstNonEmpty([variable.symbol]);
                  const meaning = firstNonEmpty([variable.meaning]);
                  return (
                    '<div class="variable-chip" style="--variable-index: ' + index + '; --variable-delay: ' + delay + 'ms">' +
                      '<div class="variable-symbol">' + renderVariableSymbolHTML(symbol) + "</div>" +
                      '<p class="variable-meaning">' + markdown(meaning) + "</p>" +
                    "</div>"
                  );
                }).join("") + "</div>"
              : "") +
          "</div>"
        );
      }

      function normalizeFunctionExpression(expression) {
        let source = safeText(expression).toLowerCase()
          .replace(/−|–|—/g, "-")
          .replace(/×|·/g, "*")
          .replace(/÷/g, "/")
          .replace(/π/g, "pi");
        const equalsIndex = source.lastIndexOf("=");
        if (equalsIndex >= 0) {
          source = source.slice(equalsIndex + 1);
        }
        return source;
      }

      function functionTokens(expression) {
        const source = normalizeFunctionExpression(expression);
        const tokens = [];
        let index = 0;
        while (index < source.length) {
          const character = source[index];
          if (/\s/.test(character)) {
            index += 1;
            continue;
          }
          if (/[0-9.]/.test(character)) {
            const start = index;
            index += 1;
            while (index < source.length && /[0-9.]/.test(source[index])) {
              index += 1;
            }
            const value = Number(source.slice(start, index));
            if (!Number.isFinite(value)) {
              throw new Error("Invalid number");
            }
            tokens.push({ type: "number", value });
            continue;
          }
          if (/[a-z]/.test(character)) {
            const start = index;
            index += 1;
            while (index < source.length && /[a-z]/.test(source[index])) {
              index += 1;
            }
            const identifier = source.slice(start, index);
            if (identifier === "x") {
              tokens.push({ type: "variable" });
            } else if (identifier === "pi") {
              tokens.push({ type: "number", value: Math.PI });
            } else if (identifier === "e") {
              tokens.push({ type: "number", value: Math.E });
            } else if (["sin", "cos", "tan", "sqrt", "abs", "log", "ln", "exp"].includes(identifier)) {
              tokens.push({ type: "function", value: identifier });
            } else {
              throw new Error("Unsupported identifier");
            }
            continue;
          }
          if ("+-*/^".includes(character)) {
            tokens.push({ type: "operator", value: character });
            index += 1;
            continue;
          }
          if (character === "(") {
            tokens.push({ type: "leftParen" });
            index += 1;
            continue;
          }
          if (character === ")") {
            tokens.push({ type: "rightParen" });
            index += 1;
            continue;
          }
          if (character === ",") {
            tokens.push({ type: "comma" });
            index += 1;
            continue;
          }
          throw new Error("Unsupported character");
        }
        return tokens;
      }

      function functionTokensWithImplicitMultiplication(expression) {
        const rawTokens = functionTokens(expression);
        const tokens = [];
        function isValueEnd(token) {
          return token && ["number", "variable", "rightParen"].includes(token.type);
        }
        function isValueStart(token) {
          return token && ["number", "variable", "function", "leftParen"].includes(token.type);
        }
        rawTokens.forEach(function (token) {
          const previous = tokens[tokens.length - 1];
          if (isValueEnd(previous) && isValueStart(token)) {
            tokens.push({ type: "operator", value: "*" });
          }
          tokens.push(token);
        });
        return tokens;
      }

      function compileFunctionExpression(expression) {
        const tokens = functionTokensWithImplicitMultiplication(expression);
        let position = 0;

        function peekOperator() {
          const token = tokens[position];
          return token && token.type === "operator" ? token.value : "";
        }

        function advance() {
          const token = tokens[position];
          position += 1;
          return token;
        }

        function consume(type) {
          const token = advance();
          if (!token || token.type !== type) {
            throw new Error("Unexpected token");
          }
        }

        function parseExpression() {
          return parseAdditive();
        }

        function parseAdditive() {
          let evaluator = parseMultiplicative();
          while (peekOperator() === "+" || peekOperator() === "-") {
            const operator = advance().value;
            const right = parseMultiplicative();
            const left = evaluator;
            evaluator = operator === "+"
              ? function (x) { return left(x) + right(x); }
              : function (x) { return left(x) - right(x); };
          }
          return evaluator;
        }

        function parseMultiplicative() {
          let evaluator = parseUnary();
          while (peekOperator() === "*" || peekOperator() === "/") {
            const operator = advance().value;
            const right = parseUnary();
            const left = evaluator;
            evaluator = operator === "*"
              ? function (x) { return left(x) * right(x); }
              : function (x) { return left(x) / right(x); };
          }
          return evaluator;
        }

        function parseUnary() {
          if (peekOperator() === "+" || peekOperator() === "-") {
            const operator = advance().value;
            const evaluator = parseUnary();
            return operator === "+"
              ? evaluator
              : function (x) { return -evaluator(x); };
          }
          return parsePower();
        }

        function parsePower() {
          const base = parsePrimary();
          if (peekOperator() !== "^") {
            return base;
          }
          advance();
          const exponent = parseUnary();
          return function (x) { return Math.pow(base(x), exponent(x)); };
        }

        function parsePrimary() {
          const token = advance();
          if (!token) {
            throw new Error("Unexpected end");
          }
          if (token.type === "number") {
            return function () { return token.value; };
          }
          if (token.type === "variable") {
            return function (x) { return x; };
          }
          if (token.type === "leftParen") {
            const evaluator = parseExpression();
            consume("rightParen");
            return evaluator;
          }
          if (token.type === "function") {
            consume("leftParen");
            const argument = parseExpression();
            consume("rightParen");
            switch (token.value) {
              case "sin": return function (x) { return Math.sin(argument(x)); };
              case "cos": return function (x) { return Math.cos(argument(x)); };
              case "tan": return function (x) { return Math.tan(argument(x)); };
              case "sqrt": return function (x) { return Math.sqrt(argument(x)); };
              case "abs": return function (x) { return Math.abs(argument(x)); };
              case "log":
              case "ln": return function (x) { return Math.log(argument(x)); };
              case "exp": return function (x) { return Math.exp(argument(x)); };
              default: throw new Error("Unsupported function");
            }
          }
          throw new Error("Unexpected token");
        }

        const evaluator = parseExpression();
        if (position !== tokens.length) {
          throw new Error("Unexpected trailing input");
        }
        return evaluator;
      }

      function formatPlotValue(value) {
        const absolute = Math.abs(value);
        if (absolute >= 100 || (absolute > 0 && absolute < 0.01)) {
          return value.toExponential(2);
        }
        return value.toFixed(2);
      }

      function formatPlotTickValue(value) {
        if (Math.abs(value) < 0.000001) {
          return "0";
        }
        if (Math.abs(value - Math.round(value)) < 0.000001) {
          return String(Math.round(value));
        }
        if (Math.abs(value) >= 100) {
          return value.toPrecision(3);
        }
        return String(Number(value.toFixed(2)));
      }

      function functionPlotUnavailable() {
        return '<div class="eyebrow">Function plot</div><p class="text-body">Plot unavailable</p>';
      }

      function clampPlotValue(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function functionPlotDomainFromValue(value, fallbackMin, fallbackMax) {
        if (Array.isArray(value) && value.length >= 2) {
          const arrayMin = numeric(value[0], NaN);
          const arrayMax = numeric(value[1], NaN);
          if (Number.isFinite(arrayMin) && Number.isFinite(arrayMax) && arrayMax > arrayMin) {
            return { min: arrayMin, max: arrayMax };
          }
        }
        if (value && typeof value === "object") {
          const objectMin = numeric(firstNonEmpty([value.min, value.lower, value.start, value.from]), NaN);
          const objectMax = numeric(firstNonEmpty([value.max, value.upper, value.end, value.to]), NaN);
          if (Number.isFinite(objectMin) && Number.isFinite(objectMax) && objectMax > objectMin) {
            return { min: objectMin, max: objectMax };
          }
        }
        return { min: fallbackMin, max: fallbackMax };
      }

      function resolveFunctionPlotDomain(content, axis, fallbackMin, fallbackMax) {
        const snakeKey = axis + "_domain";
        const camelKey = axis + "Domain";
        const rangeKey = axis + "_range";
        const camelRangeKey = axis + "Range";
        const candidates = [
          content[snakeKey],
          content[camelKey],
          content[rangeKey],
          content[camelRangeKey]
        ];
        if (content.domain && typeof content.domain === "object") {
          candidates.push(content.domain[axis]);
        }
        if (content.range && axis === "y") {
          candidates.push(content.range);
        }
        for (let index = 0; index < candidates.length; index += 1) {
          const candidate = candidates[index];
          if (candidate !== undefined && candidate !== null) {
            const domain = functionPlotDomainFromValue(candidate, fallbackMin, fallbackMax);
            if (domain.min !== fallbackMin || domain.max !== fallbackMax) {
              return domain;
            }
          }
        }
        return { min: fallbackMin, max: fallbackMax };
      }

      function functionPlotSeriesEntries(content) {
        const series = Array.isArray(content.series) ? content.series : [];
        if (series.length) {
          return series;
        }
        const expression = firstNonEmpty([content.expression, content.equation, content.formula, content.function]);
        if (!expression) {
          return [];
        }
        return [{
          kind: "function",
          expression: expression,
          label: firstNonEmpty([content.label, expression]),
          color_token: content.color_token
        }];
      }

      function isFunctionPlotSeriesEntry(seriesEntry) {
        const kind = nonEmptyString(firstNonEmpty([seriesEntry.kind, seriesEntry.type, seriesEntry.series_type]));
        return !kind || kind === "function" || kind === "curve";
      }

      function functionPlotPath(segment) {
        return segment.map(function (point, index) {
          return (index === 0 ? "M " : "L ") + point.sx.toFixed(2) + " " + point.sy.toFixed(2);
        }).join(" ");
      }

      function functionPlotSamples(frame) {
        if (frame._functionPlotSamples) {
          return frame._functionPlotSamples;
        }
        try {
          frame._functionPlotSamples = JSON.parse(frame.dataset.samples || "[]");
        } catch (_) {
          frame._functionPlotSamples = [];
        }
        return frame._functionPlotSamples;
      }

      function functionPlotKeyboardSamples(frame) {
        if (frame._functionPlotKeyboardSamples) {
          return frame._functionPlotKeyboardSamples;
        }
        frame._functionPlotKeyboardSamples = functionPlotSamples(frame).slice().sort(function (left, right) {
          const xDelta = left.sx - right.sx;
          if (Math.abs(xDelta) > 0.001) {
            return xDelta;
          }
          return numeric(left.seriesIndex, 0) - numeric(right.seriesIndex, 0);
        });
        return frame._functionPlotKeyboardSamples;
      }

      function nearestFunctionPlotSample(frame, event) {
        const samples = functionPlotSamples(frame);
        if (!samples.length) {
          return null;
        }
        const pointer = event && event.touches && event.touches.length ? event.touches[0] : event;
        const svg = frame.querySelector("svg");
        const stage = frame.querySelector(".function-plot-stage") || frame;
        if (!pointer || !svg || !stage) {
          return null;
        }

        const svgRect = svg.getBoundingClientRect();
        const width = numeric(frame.dataset.plotWidth, 360);
        const height = numeric(frame.dataset.plotHeight, 236);
        const svgX = clampPlotValue(((pointer.clientX - svgRect.left) / Math.max(svgRect.width, 1)) * width, 0, width);
        const svgY = clampPlotValue(((pointer.clientY - svgRect.top) / Math.max(svgRect.height, 1)) * height, 0, height);
        let nearest = samples[0];
        let nearestDistance = Math.abs(nearest.sx - svgX) + Math.abs(nearest.sy - svgY) * 0.18;

        samples.forEach(function (sample) {
          const distance = Math.abs(sample.sx - svgX) + Math.abs(sample.sy - svgY) * 0.18;
          if (distance < nearestDistance) {
            nearest = sample;
            nearestDistance = distance;
          }
        });

        return nearest;
      }

      function setFunctionPlotActiveSeries(frame, seriesIndex) {
        frame.querySelectorAll(".function-curve, .function-curve-glow").forEach(function (path) {
          const isActive = safeText(path.dataset.seriesIndex) === safeText(seriesIndex);
          path.classList.toggle("is-active", isActive);
          path.classList.toggle("is-muted", !isActive);
        });
      }

      function showFunctionPlotInspector(frame, eventOrSample) {
        const nearest = eventOrSample && Number.isFinite(eventOrSample.sx)
          ? eventOrSample
          : nearestFunctionPlotSample(frame, eventOrSample);
        if (!nearest) {
          return;
        }

        const svg = frame.querySelector("svg");
        const stage = frame.querySelector(".function-plot-stage") || frame;
        const tooltip = frame.querySelector(".function-plot-tooltip");
        const probe = frame.querySelector(".function-plot-probe");
        const verticalGuide = frame.querySelector(".function-plot-guide-x");
        const horizontalGuide = frame.querySelector(".function-plot-guide-y");
        const tangent = frame.querySelector(".function-plot-tangent");
        if (!svg || !stage || !tooltip || !probe || !verticalGuide || !horizontalGuide || !tangent) {
          return;
        }

        const svgRect = svg.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const width = numeric(frame.dataset.plotWidth, 360);
        const height = numeric(frame.dataset.plotHeight, 236);
        const left = (svgRect.left - stageRect.left) + (nearest.sx / width) * svgRect.width;
        const top = (svgRect.top - stageRect.top) + (nearest.sy / height) * svgRect.height;
        const color = nearest.color || "var(--accent-0)";

        frame.style.setProperty("--plot-active-color", color);
        frame.dataset.activeSeries = safeText(nearest.seriesIndex);
        frame.dataset.keyboardSampleIndex = safeText(nearest.sampleIndex);
        const keyboardPosition = functionPlotKeyboardSamples(frame).findIndex(function (sample) {
          return numeric(sample.sampleIndex, -1) === numeric(nearest.sampleIndex, -2);
        });
        if (keyboardPosition >= 0) {
          frame.dataset.keyboardPosition = safeText(keyboardPosition);
        }
        setFunctionPlotActiveSeries(frame, nearest.seriesIndex);

        probe.style.left = left + "px";
        probe.style.top = top + "px";
        probe.style.background = color;
        probe.classList.add("is-visible");

        verticalGuide.style.left = left + "px";
        verticalGuide.classList.add("is-visible");
        horizontalGuide.style.top = top + "px";
        horizontalGuide.classList.add("is-visible");

        tangent.style.left = left + "px";
        tangent.style.top = top + "px";
        tangent.style.background = color;
        tangent.style.transform = "translate(-50%, -50%) rotate(" + Math.atan(numeric(nearest.screenSlope, 0)) + "rad)";
        tangent.classList.add("is-visible");

        tooltip.innerHTML =
          '<strong>' + escapeHTML(nearest.label || "Function") + "</strong>" +
          '<span><b>x</b> ' + formatPlotValue(nearest.x) + "</span>" +
          '<span><b>y</b> ' + formatPlotValue(nearest.y) + "</span>";
        tooltip.classList.add("is-visible");

        const tooltipWidth = tooltip.offsetWidth || 156;
        const tooltipHeight = tooltip.offsetHeight || 72;
        let tooltipLeft = left + 14;
        if (tooltipLeft + tooltipWidth > stageRect.width - 12) {
          tooltipLeft = left - tooltipWidth - 14;
        }
        tooltip.style.left = clampPlotValue(tooltipLeft, 12, Math.max(12, stageRect.width - tooltipWidth - 12)) + "px";
        tooltip.style.top = clampPlotValue(top - tooltipHeight / 2, 12, Math.max(12, stageRect.height - tooltipHeight - 12)) + "px";
      }

      function showFunctionPlotTooltip(frame, event) {
        showFunctionPlotInspector(frame, event);
      }

      function hideFunctionPlotTooltip(frame) {
        const tooltip = frame.querySelector(".function-plot-tooltip");
        const probe = frame.querySelector(".function-plot-probe");
        const verticalGuide = frame.querySelector(".function-plot-guide-x");
        const horizontalGuide = frame.querySelector(".function-plot-guide-y");
        const tangent = frame.querySelector(".function-plot-tangent");
        if (tooltip) {
          tooltip.classList.remove("is-visible");
        }
        if (probe) {
          probe.classList.remove("is-visible");
        }
        if (verticalGuide) {
          verticalGuide.classList.remove("is-visible");
        }
        if (horizontalGuide) {
          horizontalGuide.classList.remove("is-visible");
        }
        if (tangent) {
          tangent.classList.remove("is-visible");
        }
        frame.querySelectorAll(".function-curve, .function-curve-glow").forEach(function (path) {
          path.classList.remove("is-active", "is-muted");
        });
        frame.classList.remove("is-scrubbing");
        delete frame.dataset.activeSeries;
      }

      function beginFunctionPlotScrub(frame, event) {
        if (!frame) {
          return;
        }
        frame.classList.add("is-scrubbing");
        if (event && event.pointerId !== undefined && frame.setPointerCapture) {
          try {
            frame.setPointerCapture(event.pointerId);
          } catch (_) {}
        }
        showFunctionPlotInspector(frame, event);
      }

      function endFunctionPlotScrub(frame, event, shouldHide) {
        if (!frame) {
          return;
        }
        frame.classList.remove("is-scrubbing");
        if (event && event.pointerId !== undefined && frame.releasePointerCapture) {
          try {
            frame.releasePointerCapture(event.pointerId);
          } catch (_) {}
        }
        if (shouldHide) {
          hideFunctionPlotTooltip(frame);
        }
      }

      function handleFunctionPlotKeyboard(frame, event) {
        const samples = functionPlotKeyboardSamples(frame);
        if (!samples.length || !["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) {
          return false;
        }
        if (event.key === "Escape") {
          hideFunctionPlotTooltip(frame);
          return true;
        }
        event.preventDefault();
        let index = Number(frame.dataset.keyboardPosition);
        if (!Number.isFinite(index)) {
          index = Math.floor(samples.length / 2);
        }
        if (event.key === "ArrowLeft") {
          index = Math.max(0, index - 1);
        } else if (event.key === "ArrowRight") {
          index = Math.min(samples.length - 1, index + 1);
        } else if (event.key === "Home") {
          index = 0;
        } else if (event.key === "End") {
          index = samples.length - 1;
        }
        showFunctionPlotInspector(frame, samples[index]);
        return true;
      }

      function renderFunctionPlotCell(content, props) {
        const showLegend = boolFlag(props.show_legend, false);
        const showAxes = boolFlag(props.show_axes, true);
        const showGrid = boolFlag(props.show_grid, true);
        const xDomain = resolveFunctionPlotDomain(content, "x", -1, 1);
        const yDomain = resolveFunctionPlotDomain(content, "y", -1, 1);
        const xMin = xDomain.min;
        const xMax = xDomain.max;
        const yMin = yDomain.min;
        const yMax = yDomain.max;
        const width = 360;
        const height = 236;
        const padding = { left: 42, right: 18, top: 20, bottom: 36 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const series = functionPlotSeriesEntries(content);
        const points = Array.isArray(content.points) ? content.points : (Array.isArray(content.markers) ? content.markers : []);
        const sampleCount = 120;

        if (xMax <= xMin || yMax <= yMin) {
          return functionPlotUnavailable();
        }

        function scaleX(value) {
          if (xMax === xMin) {
            return padding.left + plotWidth / 2;
          }
          return padding.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
        }

        function scaleY(value) {
          if (yMax === yMin) {
            return padding.top + plotHeight / 2;
          }
          return padding.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;
        }

        let svgContent = "";
        const tooltipSamples = [];
        const seriesRecords = [];

        const xAxisY = showAxes
          ? (yMin <= 0 && 0 <= yMax ? scaleY(0) : height - padding.bottom)
          : height - padding.bottom;
        const yAxisX = showAxes
          ? (xMin <= 0 && 0 <= xMax ? scaleX(0) : padding.left)
          : padding.left;

        if (showGrid || showAxes) {
          for (let index = 0; index <= 4; index += 1) {
            const x = padding.left + (plotWidth / 4) * index;
            const y = padding.top + (plotHeight / 4) * index;
            const xValue = xMin + ((xMax - xMin) * index) / 4;
            const yValue = yMax - ((yMax - yMin) * index) / 4;
            if (showGrid) {
              svgContent += '<line class="function-plot-tick-line function-plot-x-tick" x1="' + x + '" y1="' + (xAxisY - 4.5) + '" x2="' + x + '" y2="' + (xAxisY + 4.5) + '" style="--grid-delay:' + (index * 26) + 'ms;" />';
              svgContent += '<line class="function-plot-tick-line function-plot-y-tick" x1="' + (yAxisX - 4.5) + '" y1="' + y + '" x2="' + (yAxisX + 4.5) + '" y2="' + y + '" style="--grid-delay:' + (index * 26 + 18) + 'ms;" />';
            }
            if (showAxes) {
              svgContent += '<text x="' + x + '" y="' + (height - padding.bottom + 20) + '" text-anchor="middle" class="chart-tick-label function-axis-label">' + escapeHTML(formatPlotTickValue(xValue)) + "</text>";
              svgContent += '<text x="' + (padding.left - 10) + '" y="' + (y + 4) + '" text-anchor="end" class="chart-tick-label function-axis-label">' + escapeHTML(formatPlotTickValue(yValue)) + "</text>";
            }
          }
        }

        if (showAxes) {
          svgContent += '<line class="function-plot-axis-line" x1="' + padding.left + '" y1="' + xAxisY + '" x2="' + (width - padding.right) + '" y2="' + xAxisY + '" />';
          svgContent += '<line class="function-plot-axis-line" x1="' + yAxisX + '" y1="' + padding.top + '" x2="' + yAxisX + '" y2="' + (height - padding.bottom) + '" />';
        }

        series.forEach(function (seriesEntry, index) {
          if (!seriesEntry || typeof seriesEntry !== "object" || !isFunctionPlotSeriesEntry(seriesEntry)) {
            return;
          }
          const expression = firstNonEmpty([seriesEntry.expression, seriesEntry.equation, seriesEntry.formula, seriesEntry.function]);
          if (!expression) {
            return;
          }
          let evaluator;
          try {
            evaluator = compileFunctionExpression(expression);
          } catch (_) {
            return;
          }
          const color = colorForToken(seriesEntry.color_token, index);
          const label = firstNonEmpty([seriesEntry.label, expression]);
          const record = { index, color, label, segments: [], samples: [] };
          let currentSegment = [];

          function flushSegment() {
            if (currentSegment.length >= 2) {
              record.segments.push(currentSegment);
            }
            currentSegment = [];
          }

          for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
            const x = xMin + ((xMax - xMin) * sampleIndex) / Math.max(sampleCount - 1, 1);
            const y = evaluator(x);
            if (!Number.isFinite(y) || y < yMin || y > yMax) {
              flushSegment();
              continue;
            }
            const sx = scaleX(x);
            const sy = scaleY(y);
            const previous = currentSegment[currentSegment.length - 1];
            if (previous && Math.abs(previous.sy - sy) > plotHeight * 0.72) {
              flushSegment();
            }
            const sample = {
              x,
              y,
              sx,
              sy,
              color,
              label,
              seriesIndex: index,
              sampleIndex: tooltipSamples.length,
              screenSlope: 0
            };
            currentSegment.push(sample);
            record.samples.push(sample);
            tooltipSamples.push(sample);
          }
          flushSegment();
          if (record.samples.length) {
            seriesRecords.push(record);
          }
        });

        if (!tooltipSamples.length) {
          return functionPlotUnavailable();
        }

        seriesRecords.forEach(function (record, recordIndex) {
          record.samples.forEach(function (sample, sampleIndex) {
            const previous = record.samples[Math.max(0, sampleIndex - 1)];
            const next = record.samples[Math.min(record.samples.length - 1, sampleIndex + 1)];
            const deltaX = next.sx - previous.sx;
            sample.screenSlope = Math.abs(deltaX) > 0.0001 ? (next.sy - previous.sy) / deltaX : 0;
          });

          record.segments.forEach(function (segment, segmentIndex) {
            const path = functionPlotPath(segment);
            const delay = 120 + recordIndex * 110 + segmentIndex * 36;
            const style = '--plot-color: ' + record.color + '; --draw-delay: ' + delay + 'ms;';
            svgContent += '<path class="function-curve-glow" data-series-index="' + record.index + '" pathLength="1" d="' + path + '" style="' + style + '" />';
            svgContent += '<path class="function-curve" data-series-index="' + record.index + '" pathLength="1" d="' + path + '" style="' + style + '" />';
          });
        });

        points.forEach(function (point, index) {
          const pointX = numeric(point.x, NaN);
          const pointY = numeric(point.y, NaN);
          if (!Number.isFinite(pointX) || !Number.isFinite(pointY) || pointX < xMin || pointX > xMax || pointY < yMin || pointY > yMax) {
            return;
          }
          const x = scaleX(pointX);
          const y = scaleY(pointY);
          const markerColor = colorForToken(point.color_token, index + seriesRecords.length);
          const delay = 500 + index * 90;
          svgContent += '<g class="function-marker-group" style="--plot-color: ' + markerColor + '; --marker-delay: ' + delay + 'ms;">';
          svgContent += '<circle class="function-marker-ring" cx="' + x + '" cy="' + y + '" r="8" />';
          svgContent += '<circle class="function-marker" cx="' + x + '" cy="' + y + '" r="4.5" />';
          const label = nonEmptyString(point.label);
          if (label) {
            const anchor = x > width - padding.right - 74 ? "end" : "start";
            const labelX = anchor === "end" ? x - 10 : x + 10;
            const labelY = y < padding.top + 22 ? y + 20 : y - 10;
            svgContent += '<text x="' + labelX + '" y="' + labelY + '" text-anchor="' + anchor + '" class="chart-tick-label function-marker-label">' + escapeHTML(label) + "</text>";
          }
          svgContent += "</g>";
        });

        const legend = showLegend
          ? '<div class="legend-list function-plot-legend">' + seriesRecords.map(function (record) {
              return (
                '<span class="legend-item">' +
                  '<span class="legend-swatch" style="background:' + record.color + ';"></span>' +
                  '<span>' + escapeHTML(record.label) + "</span>" +
                "</span>"
              );
            }).join("") + "</div>"
          : "";

        const caption = firstNonEmpty([content.caption]);
        const ariaLabel = firstNonEmpty([
          caption,
          seriesRecords.map(function (record) { return record.label; }).join(", "),
          "Function plot"
        ]);

        return (
          '<div class="eyebrow">Function plot</div>' +
          '<div class="viz-wrapper">' +
            '<div class="viz-frame function-plot-frame" tabindex="0" role="img" aria-label="' + escapeHTML(ariaLabel) + '" data-plot-width="' + width + '" data-plot-height="' + height + '" data-samples="' + escapeHTML(JSON.stringify(tooltipSamples)) + '">' +
              '<div class="function-plot-stage">' +
                '<svg class="function-plot-svg" viewBox="0 0 ' + width + " " + height + '" aria-hidden="true">' + svgContent + "</svg>" +
                '<div class="function-plot-guide function-plot-guide-x" aria-hidden="true"></div>' +
                '<div class="function-plot-guide function-plot-guide-y" aria-hidden="true"></div>' +
                '<div class="function-plot-tangent" aria-hidden="true"></div>' +
                '<div class="function-plot-probe" aria-hidden="true"></div>' +
                '<div class="function-plot-tooltip" role="status"></div>' +
              "</div>" +
            "</div>" +
            legend +
            (caption ? '<p class="viz-caption">' + escapeHTML(caption) + "</p>" : "") +
          "</div>"
        );
      }

      let miniChartRenderCounter = 0;

      function renderMiniChartCell(content, props) {
        const rawChartType = nonEmptyString(content.chart_type) || "bar";
        const chartType = ["bar", "line", "scatter"].includes(rawChartType) ? rawChartType : "bar";
        const showLegend = boolFlag(props.show_legend, false);
        const showAxes = boolFlag(props.show_axes, true);
        const showGrid = boolFlag(props.show_grid, false);
        const width = 340;
        const height = 228;
        const padding = { left: 42, right: 18, top: 18, bottom: 42 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const xLabel = firstNonEmpty([content.x_label]);
        const yLabel = firstNonEmpty([content.y_label]);
        const caption = firstNonEmpty([content.caption]);
        const chartId = "mini-chart-" + (++miniChartRenderCounter);
        const series = normalizeMiniChartSeries(content.series);
        const hasRenderableData = series.some(function (entry) { return entry.points.length > 0; });
        const primaryLabel = firstNonEmpty([
          series.length === 1 ? series[0].label : "",
          series.length > 1 ? series.length + " series" : "",
          caption
        ]);

        if (!hasRenderableData) {
          return renderMiniChartShell({
            chartType: chartType,
            primaryLabel: "No chart data",
            caption: caption,
            xLabel: xLabel,
            yLabel: yLabel,
            legend: "",
            body: renderMiniChartPlotShell({
              yLabel: yLabel,
              frame: renderMiniChartEmptyState(chartType)
            }),
            empty: true
          });
        }

        const geometry = miniChartGeometry(chartType, series, padding, plotWidth, plotHeight);
        const defs = renderMiniChartDefs(chartId, series);
        const fieldLayer = renderMiniChartField(width, height, padding, plotWidth, plotHeight);
        const guideLayer = renderMiniChartGuideLayer(showGrid, showAxes, geometry, padding, plotWidth, plotHeight);
        const markLayer = renderMiniChartMarks(chartType, chartId, series, geometry, padding, plotWidth, plotHeight);
        const labelLayer = renderMiniChartLabels(chartType, geometry, padding, plotWidth, height);
        const svgLabel = firstNonEmpty([
          primaryLabel,
          chartType + " chart",
          xLabel && yLabel ? xLabel + " by " + yLabel : ""
        ]);

        const svg =
          '<svg class="mini-chart-svg" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' + escapeHTML(svgLabel || "Chart") + '">' +
            defs +
            '<g class="mini-chart-field-layer">' + fieldLayer + "</g>" +
            '<g class="mini-chart-guide-layer">' + guideLayer + "</g>" +
            '<g class="mini-chart-mark-layer">' + markLayer + "</g>" +
            '<g class="mini-chart-label-layer">' + labelLayer + "</g>" +
          "</svg>";

        const legend = showLegend
          ? '<div class="mini-chart-legend legend-list">' + series.map(function (entry, index) {
              return (
                '<span class="legend-item">' +
                  '<span class="legend-swatch" style="background:' + colorForToken(entry.colorToken, index) + ';"></span>' +
                  '<span>' + escapeHTML(entry.label || "Series " + (index + 1)) + "</span>" +
                "</span>"
              );
            }).join("") + "</div>"
          : "";

        return renderMiniChartShell({
          chartType: chartType,
          primaryLabel: primaryLabel,
          caption: caption,
          xLabel: xLabel,
          yLabel: yLabel,
          legend: legend,
          body:
            renderMiniChartPlotShell({
              yLabel: yLabel,
              frame:
                '<div class="mini-chart-frame" data-chart-type="' + escapeHTML(chartType) + '">' +
                  '<div class="mini-chart-stage">' +
                    svg +
                    '<div class="mini-chart-tooltip" role="status" aria-live="polite"></div>' +
                  "</div>" +
                "</div>"
            }),
          empty: false
        });
      }

      function normalizeMiniChartSeries(rawSeries) {
        return (Array.isArray(rawSeries) ? rawSeries : []).map(function (entry, seriesIndex) {
          const points = Array.isArray(entry.points)
            ? entry.points
            : [];
          return {
            label: firstNonEmpty([entry.label, "Series " + (seriesIndex + 1)]),
            colorToken: nonEmptyString(entry.color_token) || "lesson_" + (seriesIndex % 4),
            points: points
          };
        }).filter(function (entry) {
          return entry.points.length > 0;
        });
      }

      function renderMiniChartShell(config) {
        const header = config.primaryLabel
          ? '<header class="mini-chart-header">' +
              '<div class="mini-chart-heading">' +
                '<div class="mini-chart-title">' + escapeHTML(config.primaryLabel) + "</div>" +
              "</div>" +
            "</header>"
          : "";
        const xAxisLabel = config.xLabel
          ? '<div class="mini-chart-x-axis-label">' +
              '<span class="chart-caption-label">X</span>' +
              '<span class="mini-chart-axis-copy">' + escapeHTML(config.xLabel) + "</span>" +
            "</div>"
          : "";

        return (
          '<div class="mini-chart" data-chart-type="' + escapeHTML(config.chartType) + '" data-empty="' + (config.empty ? "true" : "false") + '">' +
            header +
            config.body +
            '<div class="mini-chart-footer' + (config.yLabel ? " has-y-axis-label" : "") + '">' +
              xAxisLabel +
              config.legend +
              (config.caption ? '<p class="viz-caption mini-chart-caption">' + escapeHTML(config.caption) + "</p>" : "") +
            "</div>" +
          "</div>"
        );
      }

      function renderMiniChartPlotShell(config) {
        const yAxisLabel = config.yLabel
          ? '<div class="mini-chart-y-axis-label">' +
              '<span class="mini-chart-y-axis-label-inner">' +
                '<span class="chart-caption-label">Y</span>' +
                '<span class="mini-chart-axis-copy">' + escapeHTML(config.yLabel) + "</span>" +
              "</span>" +
            "</div>"
          : "";
        return (
          '<div class="mini-chart-plot-shell' + (config.yLabel ? " has-y-axis-label" : "") + '">' +
            yAxisLabel +
            config.frame +
          "</div>"
        );
      }

      function renderMiniChartEmptyState(chartType) {
        return (
          '<div class="mini-chart-frame mini-chart-empty-frame" data-chart-type="' + escapeHTML(chartType) + '">' +
            '<div class="mini-chart-empty-state" aria-live="polite">' +
              '<div class="mini-chart-empty-glyph" aria-hidden="true">' +
                '<span></span><span></span><span></span>' +
              "</div>" +
              '<div class="mini-chart-empty-copy">' +
                '<strong>Chart waiting for data</strong>' +
                '<span>The renderer is ready, but this slot did not include chart points.</span>' +
              "</div>" +
            "</div>" +
          "</div>"
        );
      }

      function miniChartGeometry(chartType, series, padding, plotWidth, plotHeight) {
        const allPoints = series.flatMap(function (entry) { return entry.points; });
        if (chartType === "scatter") {
          const xValues = allPoints.map(function (point) { return numeric(point.x, 0); });
          const yValues = allPoints.map(function (point) { return numeric(point.y, 0); });
          return {
            chartType: chartType,
            xDomain: paddedDomain(xValues, 0, 1),
            yDomain: paddedDomain(yValues.concat([0]), 0, 1),
            categories: []
          };
        }

        const categories = [];
        series.forEach(function (entry) {
          entry.points.forEach(function (point, index) {
            const label = firstNonEmpty([point.x_label, point.label, String(index + 1)]);
            if (!categories.includes(label)) {
              categories.push(label);
            }
          });
        });
        const yValues = allPoints.map(function (point) { return numeric(point.y, 0); }).concat([0]);
        return {
          chartType: chartType,
          xDomain: { min: 0, max: Math.max(categories.length - 1, 1) },
          yDomain: paddedDomain(yValues, 0, 1),
          categories: categories
        };
      }

      function paddedDomain(values, fallbackMin, fallbackMax) {
        const finiteValues = values.filter(function (value) { return Number.isFinite(value); });
        const minValue = finiteValues.length ? Math.min.apply(null, finiteValues) : fallbackMin;
        const maxValue = finiteValues.length ? Math.max.apply(null, finiteValues) : fallbackMax;
        if (minValue === maxValue) {
          return { min: Math.min(0, minValue - 1), max: maxValue + 1 };
        }
        const span = maxValue - minValue;
        const padding = span * 0.08;
        return {
          min: Math.min(0, minValue - padding),
          max: maxValue + padding
        };
      }

      function miniChartScaleX(value, domain, padding, plotWidth) {
        return padding.left + ((value - domain.min) / Math.max(domain.max - domain.min, 1)) * plotWidth;
      }

      function miniChartScaleY(value, domain, padding, plotHeight) {
        return padding.top + plotHeight - ((value - domain.min) / Math.max(domain.max - domain.min, 1)) * plotHeight;
      }

      function miniChartPercent(value, total) {
        return Math.max(0, Math.min(100, (value / Math.max(total, 1)) * 100));
      }

      function miniChartValueLabel(value) {
        const numericValue = numeric(value, 0);
        if (Math.abs(numericValue - Math.round(numericValue)) < 0.001) {
          return String(Math.round(numericValue));
        }
        return String(Math.round(numericValue * 10) / 10);
      }

      function renderMiniChartDefs(chartId, series) {
        const gradients = series.map(function (entry, index) {
          const color = colorForToken(entry.colorToken, index);
          const gradientId = chartId + "-gradient-" + index;
          const glowId = chartId + "-glow-" + index;
          return (
            '<linearGradient id="' + gradientId + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
              '<stop offset="0%" stop-color="' + color + '" stop-opacity="1" />' +
              '<stop offset="100%" stop-color="' + color + '" stop-opacity="0.68" />' +
            "</linearGradient>" +
            '<radialGradient id="' + glowId + '" cx="50%" cy="45%" r="62%">' +
              '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.40" />' +
              '<stop offset="100%" stop-color="' + color + '" stop-opacity="0" />' +
            "</radialGradient>"
          );
        }).join("");
        return '<defs>' + gradients + "</defs>";
      }

      function renderMiniChartField(width, height, padding, plotWidth, plotHeight) {
        return (
          '<rect class="mini-chart-soft-field" x="' + padding.left + '" y="' + padding.top + '" width="' + plotWidth + '" height="' + plotHeight + '" rx="16" />' +
          '<path class="mini-chart-field-shine" d="M ' + padding.left + " " + (padding.top + plotHeight * 0.18) + " C " + (padding.left + plotWidth * 0.28) + " " + (padding.top - 6) + ", " + (padding.left + plotWidth * 0.70) + " " + (padding.top + plotHeight * 0.34) + ", " + (width - padding.right) + " " + (padding.top + 10) + '" />'
        );
      }

      function renderMiniChartGuideLayer(showGrid, showAxes, geometry, padding, plotWidth, plotHeight) {
        let output = "";
        if (showGrid) {
          for (let index = 0; index <= 4; index += 1) {
            const y = padding.top + (plotHeight / 4) * index;
            output += '<line class="mini-chart-grid-line" x1="' + padding.left + '" y1="' + y + '" x2="' + (padding.left + plotWidth) + '" y2="' + y + '" style="--guide-delay:' + (index * 55) + 'ms" />';
          }
        }
        if (showAxes) {
          const baselineValue = geometry.yDomain.min <= 0 && geometry.yDomain.max >= 0 ? 0 : geometry.yDomain.min;
          const axisY = miniChartScaleY(baselineValue, geometry.yDomain, padding, plotHeight);
          output += '<line class="mini-chart-axis-line mini-chart-axis-x" x1="' + padding.left + '" y1="' + axisY + '" x2="' + (padding.left + plotWidth) + '" y2="' + axisY + '" />';
          output += '<line class="mini-chart-axis-line mini-chart-axis-y" x1="' + padding.left + '" y1="' + padding.top + '" x2="' + padding.left + '" y2="' + (padding.top + plotHeight) + '" />';
        }
        return output;
      }

      function renderMiniChartMarks(chartType, chartId, series, geometry, padding, plotWidth, plotHeight) {
        if (chartType === "scatter") {
          return renderMiniChartScatterMarks(chartId, series, geometry, padding, plotWidth, plotHeight);
        }
        if (chartType === "line") {
          return renderMiniChartLineMarks(chartId, series, geometry, padding, plotWidth, plotHeight);
        }
        return renderMiniChartBarMarks(chartId, series, geometry, padding, plotWidth, plotHeight);
      }

      function renderMiniChartBarMarks(chartId, series, geometry, padding, plotWidth, plotHeight) {
        const categories = geometry.categories;
        const groupWidth = plotWidth / Math.max(categories.length, 1);
        const barGap = series.length > 1 ? 4 : 0;
        const barWidth = Math.min(34, Math.max(10, (groupWidth * 0.68 - barGap * Math.max(series.length - 1, 0)) / Math.max(series.length, 1)));
        const baselineValue = geometry.yDomain.min <= 0 && geometry.yDomain.max >= 0 ? 0 : geometry.yDomain.min;
        const baseline = miniChartScaleY(baselineValue, geometry.yDomain, padding, plotHeight);
        let output = "";

        series.forEach(function (entry, seriesIndex) {
          const gradientId = chartId + "-gradient-" + seriesIndex;
          entry.points.forEach(function (point, pointIndex) {
            const label = firstNonEmpty([point.x_label, point.label, String(pointIndex + 1)]);
            const categoryIndex = Math.max(0, categories.indexOf(label));
            const value = numeric(point.y, 0);
            const y = miniChartScaleY(value, geometry.yDomain, padding, plotHeight);
            const barHeight = Math.max(2, Math.abs(baseline - y));
            const x = padding.left + categoryIndex * groupWidth + (groupWidth - (barWidth * series.length + barGap * Math.max(series.length - 1, 0))) / 2 + seriesIndex * (barWidth + barGap);
            const top = Math.min(y, baseline);
            const markId = "bar-" + seriesIndex + "-" + pointIndex;
            const tipX = miniChartPercent(x + barWidth / 2, 340);
            const tipY = miniChartPercent(top, 228);
            output += (
              '<rect class="mini-chart-mark mini-chart-bar" tabindex="0" role="button" aria-label="' + escapeHTML(entry.label + ", " + label + ", " + miniChartValueLabel(value)) + '"' +
                ' data-mark-id="' + escapeHTML(markId) + '"' +
                ' data-series-label="' + escapeHTML(entry.label) + '"' +
                ' data-x-label="' + escapeHTML(label) + '"' +
                ' data-y-value="' + escapeHTML(miniChartValueLabel(value)) + '"' +
                ' data-tip-x="' + tipX + '"' +
                ' data-tip-y="' + tipY + '"' +
                ' x="' + x + '" y="' + top + '" width="' + barWidth + '" height="' + barHeight + '" rx="8"' +
                ' fill="url(#' + gradientId + ')" style="--mark-color:' + colorForToken(entry.colorToken, seriesIndex) + '; --mark-delay:' + ((categoryIndex * 85) + (seriesIndex * 45)) + 'ms;" />'
            );
          });
        });

        return output;
      }

      function renderMiniChartLineMarks(chartId, series, geometry, padding, plotWidth, plotHeight) {
        const categories = geometry.categories;
        const baseline = miniChartScaleY(geometry.yDomain.min <= 0 && geometry.yDomain.max >= 0 ? 0 : geometry.yDomain.min, geometry.yDomain, padding, plotHeight);
        let output = "";

        series.forEach(function (entry, seriesIndex) {
          const color = colorForToken(entry.colorToken, seriesIndex);
          const gradientId = chartId + "-gradient-" + seriesIndex;
          const points = entry.points.map(function (point, pointIndex) {
            const label = firstNonEmpty([point.x_label, point.label, String(pointIndex + 1)]);
            const categoryIndex = Math.max(0, categories.indexOf(label));
            const x = categories.length > 1
              ? padding.left + (categoryIndex / Math.max(categories.length - 1, 1)) * plotWidth
              : padding.left + plotWidth / 2;
            const y = miniChartScaleY(numeric(point.y, 0), geometry.yDomain, padding, plotHeight);
            return {
              x: x,
              y: y,
              label: label,
              value: numeric(point.y, 0),
              originalIndex: pointIndex
            };
          });
          const polyline = points.map(function (point) { return point.x + "," + point.y; }).join(" ");
          const area = points.length
            ? points.map(function (point) { return point.x + "," + point.y; }).join(" ") + " " + points[points.length - 1].x + "," + baseline + " " + points[0].x + "," + baseline
            : "";
          if (area) {
            output += '<polygon class="mini-chart-line-area" points="' + area + '" fill="url(#' + gradientId + ')" style="--mark-color:' + color + '; --mark-delay:' + (seriesIndex * 120) + 'ms" />';
          }
          output += '<polyline class="mini-chart-line-glow" points="' + polyline + '" pathLength="1" style="--mark-color:' + color + '; --mark-delay:' + (seriesIndex * 120) + 'ms" />';
          output += '<polyline class="mini-chart-line-path" points="' + polyline + '" pathLength="1" style="--mark-color:' + color + '; --mark-delay:' + (seriesIndex * 120) + 'ms" />';
          points.forEach(function (point, pointIndex) {
            const markId = "line-" + seriesIndex + "-" + pointIndex;
            output += renderMiniChartPointMark({
              markId: markId,
              seriesLabel: entry.label,
              xLabel: point.label,
              yValue: point.value,
              x: point.x,
              y: point.y,
              color: color,
              delay: 420 + pointIndex * 90 + seriesIndex * 120,
              radius: 5,
              label: ""
            });
          });
        });

        return output;
      }

      function renderMiniChartScatterMarks(chartId, series, geometry, padding, plotWidth, plotHeight) {
        let output = "";
        series.forEach(function (entry, seriesIndex) {
          const color = colorForToken(entry.colorToken, seriesIndex);
          entry.points.forEach(function (point, pointIndex) {
            const xValue = numeric(point.x, 0);
            const yValue = numeric(point.y, 0);
            const x = miniChartScaleX(xValue, geometry.xDomain, padding, plotWidth);
            const y = miniChartScaleY(yValue, geometry.yDomain, padding, plotHeight);
            const label = firstNonEmpty([point.point_label, point.label]);
            output += renderMiniChartPointMark({
              markId: "scatter-" + seriesIndex + "-" + pointIndex,
              seriesLabel: entry.label,
              xLabel: label || miniChartValueLabel(xValue),
              yValue: yValue,
              x: x,
              y: y,
              color: color,
              delay: pointIndex * 85 + seriesIndex * 80,
              radius: 5.5,
              label: label
            });
          });
        });
        return output;
      }

      function renderMiniChartPointMark(config) {
        const yLabel = miniChartValueLabel(config.yValue);
        const tipX = miniChartPercent(config.x, 340);
        const tipY = miniChartPercent(config.y, 228);
        return (
          '<g class="mini-chart-mark mini-chart-point-wrap" tabindex="0" role="button" aria-label="' + escapeHTML(config.seriesLabel + ", " + config.xLabel + ", " + yLabel) + '"' +
            ' data-mark-id="' + escapeHTML(config.markId) + '"' +
            ' data-series-label="' + escapeHTML(config.seriesLabel) + '"' +
            ' data-x-label="' + escapeHTML(config.xLabel) + '"' +
            ' data-y-value="' + escapeHTML(yLabel) + '"' +
            ' data-tip-x="' + tipX + '"' +
            ' data-tip-y="' + tipY + '"' +
            ' style="--mark-color:' + config.color + '; --mark-delay:' + config.delay + 'ms; transform-origin:' + config.x + 'px ' + config.y + 'px;">' +
              '<circle class="mini-chart-point-glow" cx="' + config.x + '" cy="' + config.y + '" r="' + (config.radius + 8) + '" />' +
              '<circle class="mini-chart-point-ring" cx="' + config.x + '" cy="' + config.y + '" r="' + (config.radius + 3) + '" />' +
              '<circle class="mini-chart-point" cx="' + config.x + '" cy="' + config.y + '" r="' + config.radius + '" />' +
              (config.label ? '<text x="' + (config.x + 9) + '" y="' + (config.y - 9) + '" class="mini-chart-point-label chart-tick-label">' + escapeHTML(config.label) + "</text>" : "") +
          "</g>"
        );
      }

      function renderMiniChartLabels(chartType, geometry, padding, plotWidth, height) {
        if (chartType === "scatter") {
          return "";
        }
        const categories = geometry.categories;
        if (!categories.length) {
          return "";
        }
        return categories.map(function (category, index) {
          const x = chartType === "line" && categories.length > 1
            ? padding.left + (index / Math.max(categories.length - 1, 1)) * plotWidth
            : padding.left + (index + 0.5) * (plotWidth / Math.max(categories.length, 1));
          return '<text x="' + x + '" y="' + (height - 15) + '" text-anchor="middle" class="mini-chart-axis-label chart-tick-label" style="--label-delay:' + (index * 45) + 'ms">' + escapeHTML(category) + "</text>";
        }).join("");
      }

      function prepareMiniChartInteractions(scope) {
        const interactionRoot = scope || rootNode;
        if (!interactionRoot || interactionRoot.dataset.miniChartInteractionsBound === "true") {
          return;
        }
        interactionRoot.dataset.miniChartInteractionsBound = "true";

        interactionRoot.addEventListener("pointerover", function (event) {
          const mark = event.target.closest(".mini-chart-mark");
          if (mark) {
            activateMiniChartMark(mark);
          }
        });

        interactionRoot.addEventListener("pointerdown", function (event) {
          const mark = event.target.closest(".mini-chart-mark");
          if (mark) {
            activateMiniChartMark(mark);
            if (mark.focus) {
              try {
                mark.focus({ preventScroll: true });
              } catch (error) {
                mark.focus();
              }
            }
            return;
          }
          if (!event.target.closest(".mini-chart")) {
            clearAllMiniChartMarks(interactionRoot);
          }
        });

        interactionRoot.addEventListener("pointerout", function (event) {
          const chart = event.target.closest(".mini-chart");
          if (chart && !chart.contains(event.relatedTarget)) {
            clearMiniChartMark(chart);
          }
        });

        interactionRoot.addEventListener("focusin", function (event) {
          const mark = event.target.closest(".mini-chart-mark");
          if (mark) {
            activateMiniChartMark(mark);
          }
        });

        interactionRoot.addEventListener("focusout", function (event) {
          const chart = event.target.closest(".mini-chart");
          if (chart && !chart.contains(event.relatedTarget)) {
            clearMiniChartMark(chart);
          }
        });

        interactionRoot.addEventListener("keydown", function (event) {
          if (event.key !== "Escape") {
            return;
          }
          const chart = event.target.closest(".mini-chart");
          if (chart) {
            clearMiniChartMark(chart);
          }
        });
      }

      function activateMiniChartMark(mark) {
        const chart = mark.closest(".mini-chart");
        if (!chart) {
          return;
        }
        chart.querySelectorAll(".mini-chart-mark.is-active").forEach(function (activeMark) {
          activeMark.classList.remove("is-active");
        });
        mark.classList.add("is-active");
        chart.classList.add("has-active");

        const tooltip = chart.querySelector(".mini-chart-tooltip");
        if (!tooltip) {
          return;
        }
        const seriesLabel = nonEmptyString(mark.dataset.seriesLabel) || "Series";
        const xLabel = nonEmptyString(mark.dataset.xLabel) || "Value";
        const yValue = nonEmptyString(mark.dataset.yValue) || "0";
        const tipX = Math.max(12, Math.min(88, numeric(mark.dataset.tipX, 50)));
        const tipY = Math.max(12, Math.min(88, numeric(mark.dataset.tipY, 50)));
        tooltip.innerHTML =
          '<strong>' + escapeHTML(seriesLabel) + "</strong>" +
          '<span>' + escapeHTML(xLabel) + "</span>" +
          '<b>' + escapeHTML(yValue) + "</b>";
        tooltip.style.left = tipX + "%";
        tooltip.style.top = tipY + "%";
        tooltip.classList.toggle("mini-chart-tooltip-below", tipY < 28);
        tooltip.classList.add("is-visible");
      }

      function clearMiniChartMark(chart) {
        chart.classList.remove("has-active");
        chart.querySelectorAll(".mini-chart-mark.is-active").forEach(function (activeMark) {
          activeMark.classList.remove("is-active");
        });
        const tooltip = chart.querySelector(".mini-chart-tooltip");
        if (tooltip) {
          tooltip.classList.remove("is-visible", "mini-chart-tooltip-below");
        }
      }

      function clearAllMiniChartMarks(scope) {
        Array.from((scope || rootNode).querySelectorAll(".mini-chart.has-active")).forEach(clearMiniChartMark);
      }

      function renderCodeTraceCell(content, props) {
        const language = firstNonEmpty([content.language]).toUpperCase();
        const code = safeText(content.code || "");
        const showLineNumbers = boolFlag(props.show_line_numbers, true);
        const traceSteps = Array.isArray(content.trace_steps) ? content.trace_steps : [];
        const highlightedLines = new Set(traceSteps.map(function (step) {
          return numeric(step.focus_line, 0);
        }).filter(Boolean));

        const lines = code.replace(/\n$/, "").split("\n");
        const codeMarkup = lines.map(function (line, index) {
          const lineNumber = index + 1;
          return (
            '<div class="code-line' + (highlightedLines.has(lineNumber) ? " is-highlighted" : "") + '">' +
              (showLineNumbers ? '<span class="code-number">' + lineNumber + "</span>" : "") +
              '<span class="code-content">' + escapeHTML(line || " ") + "</span>" +
            "</div>"
          );
        }).join("");

        const traceMarkup = traceSteps.map(function (step, index) {
          const stateEntries = Object.entries(step.state || {});
          return (
            '<div class="trace-step">' +
              '<div class="trace-topline">' +
                '<span class="trace-step-label">Step ' + (index + 1) + "</span>" +
                (step.focus_line ? '<span class="focus-chip">Line ' + escapeHTML(step.focus_line) + "</span>" : "") +
              "</div>" +
              '<p class="trace-copy">' + markdown(firstNonEmpty([step.step])) + "</p>" +
              (boolFlag(props.show_state_panel, true) && stateEntries.length
                ? '<div class="state-panel">' + stateEntries.map(function (entry) {
                    return (
                      '<span class="state-chip">' +
                        '<span class="state-key">' + escapeHTML(entry[0]) + "</span>" +
                        '<span class="state-value">' + escapeHTML(entry[1]) + "</span>" +
                      "</span>"
                    );
                  }).join("") + "</div>"
                : "") +
            "</div>"
          );
        }).join("");

        const result = firstNonEmpty([content.result]);

        return (
          '<div class="eyebrow">Code trace' + (language ? " • " + escapeHTML(language) : "") + "</div>" +
          '<div class="code-block">' + codeMarkup + "</div>" +
          '<div class="trace-list">' + traceMarkup + "</div>" +
          (result ? '<div class="trace-result">' + escapeHTML(result) + "</div>" : "")
        );
      }

      function renderMapRegionCell(content, props) {
        const width = 320;
        const height = 210;
        const showLabels = boolFlag(props.show_labels, true);
        const highlightStyle = nonEmptyString(props.highlight_style) || "fill";
        const points = Array.isArray(content.points) ? content.points : [];
        const regions = Array.isArray(content.regions) ? content.regions : [];
        const routes = Array.isArray(content.routes) ? content.routes : [];
        const pointsById = new Map(points.map(function (point) {
          return [safeText(point.id), point];
        }));
        let svgContent = '<rect x="10" y="10" width="' + (width - 20) + '" height="' + (height - 20) + '" rx="18" fill="rgba(255,255,255,0.05)" stroke="var(--surface-line)" />';

        function scaledPoint(point) {
          return {
            x: 10 + numeric(point.x, 0) * (width - 20),
            y: 10 + numeric(point.y, 0) * (height - 20)
          };
        }

        regions.forEach(function (region, index) {
          const polygon = Array.isArray(region.polygon) ? region.polygon : [];
          const coordinates = polygon.map(function (point) {
            const normalized = Array.isArray(point)
              ? { x: numeric(point[0], 0), y: numeric(point[1], 0) }
              : { x: numeric(point.x, 0), y: numeric(point.y, 0) };
            return (10 + normalized.x * (width - 20)) + "," + (10 + normalized.y * (height - 20));
          }).join(" ");
          if (!coordinates) {
            return;
          }
          svgContent += '<polygon points="' + coordinates + '" fill="' + (highlightStyle === "outline" ? "transparent" : colorForToken(region.color_token, index)) + '" fill-opacity="' + (highlightStyle === "outline" ? "0" : "0.14") + '" stroke="' + colorForToken(region.color_token, index) + '" stroke-width="2" />';
        });

        routes.forEach(function (route, index) {
          const source = pointsById.get(safeText(route.from_id));
          const target = pointsById.get(safeText(route.to_id));
          if (!source || !target) {
            return;
          }
          const sourcePoint = scaledPoint(source);
          const targetPoint = scaledPoint(target);
          svgContent += '<line x1="' + sourcePoint.x + '" y1="' + sourcePoint.y + '" x2="' + targetPoint.x + '" y2="' + targetPoint.y + '" stroke="' + colorForToken(route.color_token, index + 1) + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 5" />';
          if (showLabels && nonEmptyString(route.label)) {
            const midX = (sourcePoint.x + targetPoint.x) / 2;
            const midY = (sourcePoint.y + targetPoint.y) / 2;
            svgContent += '<text x="' + midX + '" y="' + (midY - 8) + '" text-anchor="middle" class="route-label">' + escapeHTML(route.label) + "</text>";
          }
        });

        points.forEach(function (point, index) {
          const scaled = scaledPoint(point);
          svgContent += '<circle cx="' + scaled.x + '" cy="' + scaled.y + '" r="6" fill="' + colorForToken(point.color_token, index + 2) + '" />';
          svgContent += '<circle cx="' + scaled.x + '" cy="' + scaled.y + '" r="11" fill="transparent" stroke="' + colorForToken(point.color_token, index + 2) + '" stroke-opacity="0.22" stroke-width="2" />';
          if (showLabels && nonEmptyString(point.label)) {
            svgContent += '<text x="' + (scaled.x + 12) + '" y="' + (scaled.y - 10) + '" class="chart-tick-label">' + escapeHTML(point.label) + "</text>";
          }
        });

        const caption = firstNonEmpty([content.caption]);

        return (
          '<div class="eyebrow">Map region</div>' +
          '<div class="viz-wrapper">' +
            '<div class="viz-frame">' +
              '<svg viewBox="0 0 ' + width + " " + height + '" aria-hidden="true">' + svgContent + "</svg>" +
            "</div>" +
            (caption ? '<p class="map-caption">' + escapeHTML(caption) + "</p>" : "") +
          "</div>"
        );
      }

      rootNode.addEventListener("click", function (event) {
        const prompt = event.target.closest("[data-recall-prompt='true']");
        if (prompt) {
          toggleRecallPrompt(prompt);
        }
      });

      rootNode.addEventListener("keydown", function (event) {
        const plotFrame = event.target.closest(".function-plot-frame");
        if (plotFrame && handleFunctionPlotKeyboard(plotFrame, event)) {
          return;
        }

        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        const prompt = event.target.closest("[data-recall-prompt='true']");
        if (prompt) {
          event.preventDefault();
          toggleRecallPrompt(prompt);
        }
      });

      rootNode.addEventListener("pointermove", function (event) {
        const frame = event.target.closest(".function-plot-frame");
        if (frame) {
          showFunctionPlotInspector(frame, event);
        }
      });

      rootNode.addEventListener("pointerdown", function (event) {
        const frame = event.target.closest(".function-plot-frame");
        if (frame) {
          beginFunctionPlotScrub(frame, event);
        }
      });

      rootNode.addEventListener("pointerout", function (event) {
        const frame = event.target.closest(".function-plot-frame");
        if (frame && !frame.contains(event.relatedTarget)) {
          hideFunctionPlotTooltip(frame);
        }
      });

      rootNode.addEventListener("pointerup", function (event) {
        const frame = event.target.closest(".function-plot-frame") || rootNode.querySelector(".function-plot-frame.is-scrubbing");
        if (frame) {
          endFunctionPlotScrub(frame, event, false);
        }
      });

      rootNode.addEventListener("pointercancel", function (event) {
        const frame = event.target.closest(".function-plot-frame") || rootNode.querySelector(".function-plot-frame.is-scrubbing");
        if (frame) {
          endFunctionPlotScrub(frame, event, true);
        }
      });

      rootNode.addEventListener("pointerleave", function (event) {
        const frame = event.target.closest(".function-plot-frame");
        if (frame) {
          hideFunctionPlotTooltip(frame);
        }
      });

      rootNode.addEventListener("touchmove", function (event) {
        const frame = event.target.closest(".function-plot-frame");
        if (frame) {
          showFunctionPlotInspector(frame, event);
        }
      }, { passive: true });

      rootNode.addEventListener("touchend", function (event) {
        const frame = rootNode.querySelector(".function-plot-frame.is-scrubbing");
        if (frame) {
          endFunctionPlotScrub(frame, event, false);
        }
      }, { passive: true });

      let resizeFrame = null;
      window.addEventListener("resize", function () {
        if (resizeFrame !== null) {
          window.cancelAnimationFrame(resizeFrame);
        }
        resizeFrame = window.requestAnimationFrame(function () {
          resizeFrame = null;
          if (typeof handleGridViewportResize === "function") {
            handleGridViewportResize();
          } else {
            renderDocument();
          }
        });
      });

      renderDocument();
})();
