import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { aiSuggestions } from '@/data/dashboard';

interface AIAssistantCardProps {
  onSubmitQuestion?: (question: string) => void;
  onSuggestionPress?: (suggestion: string) => void;
  onMicPress?: () => void;
}

export function AIAssistantCard({
  onSubmitQuestion,
  onSuggestionPress,
  onMicPress,
}: AIAssistantCardProps) {
  const [question, setQuestion] = useState('');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.botBadge}>
          <MaterialCommunityIcons name="robot-outline" size={22} color={Colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Ask anything about your PGs</Text>
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Type your question..."
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (question.trim().length > 0) {
              onSubmitQuestion?.(question.trim());
            }
          }}
        />
        <Pressable
          onPress={onMicPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ask with voice">
          <Ionicons name="mic-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.suggestionGrid}>
        {aiSuggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => {
              setQuestion(suggestion);
              onSuggestionPress?.(suggestion);
            }}
            style={({ pressed }) => [
              styles.suggestionChip,
              pressed && styles.suggestionChipPressed,
            ]}>
            <Text style={styles.suggestionText} numberOfLines={2}>
              {suggestion}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  botBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12.5,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 46,
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: '100%',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primarySoftBorder,
  },
  suggestionChipPressed: {
    opacity: 0.7,
  },
  suggestionText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 16,
  },
});
