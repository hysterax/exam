import React from 'react';
import { View } from 'react-native';
import { C } from '../constants/theme';

export const Divider = () => (
  <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 14 }} />
);
