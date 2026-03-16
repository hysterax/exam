import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { s } from '../styles';
import { daysLeft } from '../utils/helpers';

export function DueBadge({ dueDate }: { dueDate: string }) {
  const d = daysLeft(dueDate);
  let label = `${d}d left`;
  let color = C.teal;
  let bg    = C.tealLight;

  if (d < 0)        { label = `${Math.abs(d)}d overdue`; color = C.red;   bg = C.redLight;   }
  else if (d === 0) { label = 'Due today';                color = C.amber; bg = C.amberLight; }
  else if (d <= 2)  { label = `${d}d left`;               color = C.amber; bg = C.amberLight; }

  return (
    <View style={[s.badge, { backgroundColor: bg, borderColor: color + '55' }]}>
      <Ionicons
        name={d < 0 ? 'alert-circle' : d <= 2 ? 'warning' : 'time-outline'}
        size={10}
        color={color}
      />
      <Text style={[s.badgeTxt, { color }]}>{label}</Text>
    </View>
  );
}
