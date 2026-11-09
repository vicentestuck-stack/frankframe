import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import type { Lens } from "@/lib/data/types";

export function LensCarousel({
  lenses,
  selectedId,
  onSelect,
  onLockedPress,
}: {
  lenses: Lens[];
  selectedId: string | null;
  onSelect: (lens: Lens | null) => void;
  onLockedPress: (lens: Lens) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="list"
    >
      <LensThumb
        label="None"
        emoji="🚫"
        selected={selectedId === null}
        onPress={() => onSelect(null)}
      />
      {lenses.map((lens) => (
        <LensThumb
          key={lens.id}
          label={lens.name}
          emoji={lens.thumbnailEmoji}
          selected={selectedId === lens.id}
          locked={lens.isPremium}
          onPress={() => (lens.isPremium ? onLockedPress(lens) : onSelect(lens))}
        />
      ))}
    </ScrollView>
  );
}

function LensThumb({
  label,
  emoji,
  selected,
  locked,
  onPress,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${locked ? ", premium, locked" : ""}${selected ? ", selected" : ""}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.item}
    >
      <View style={[styles.thumb, selected && styles.thumbSelected]}>
        <Text style={styles.emoji}>{emoji}</Text>
        {locked ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: theme.space[2], paddingHorizontal: theme.space[4] },
  item: { width: 64, alignItems: "center" },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.surface,
    borderWidth: 2,
    borderColor: theme.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbSelected: { borderColor: theme.color.accent, transform: [{ scale: 1.08 }] },
  emoji: { fontSize: 24 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.color.warning,
    borderRadius: theme.radius.pill,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, color: theme.color.bg, fontWeight: "700" },
  label: {
    marginTop: theme.space[1],
    fontSize: theme.type.xs.size,
    color: theme.color.textMuted,
    textAlign: "center",
  },
});
