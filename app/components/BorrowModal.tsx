import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, BORROW_DAYS, PENALTY_PER_DAY } from '../constants/theme';
import { s } from '../styles';
import { fmtFull } from '../utils/helpers';
import { CD } from '../types';

interface Props {
  visible:      boolean;
  selectedCD:   CD | null;
  borrowerName: string;
  onClose:      () => void;
  onChangeName: (name: string) => void;
  onConfirm:    () => void;
}

export function BorrowModal({ visible, selectedCD, borrowerName, onClose, onChangeName, onConfirm }: Props) {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + BORROW_DAYS);
  const previewDueIso = due.toISOString();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetBar} />

          {/* Header */}
          <View style={s.sheetHd}>
            <View style={s.sheetHdIco}>
              <Ionicons name="arrow-down-circle-outline" size={20} color={C.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetTitle}>Borrow CD</Text>
              {selectedCD && (
                <Text style={s.sheetSub}>{selectedCD.title} · {selectedCD.artist}</Text>
              )}
            </View>
            <TouchableOpacity style={s.sheetClose} onPress={onClose}>
              <Ionicons name="close" size={17} color={C.slate} />
            </TouchableOpacity>
          </View>
          {selectedCD && (
            <View style={s.preview}>
              <View style={s.previewStats}>
                <View style={s.previewStat}>
                  <Text style={s.pStatLbl}>Available</Text>
                  <Text style={[s.pStatVal, { color: C.teal }]}>{selectedCD.copies}</Text>
                </View>
                <View style={s.pDivider} />
                <View style={s.previewStat}>
                  <Text style={s.pStatLbl}>Loan period</Text>
                  <Text style={[s.pStatVal, { color: C.slate }]}>{BORROW_DAYS} days</Text>
                </View>
                <View style={s.pDivider} />
                <View style={s.previewStat}>
                  <Text style={s.pStatLbl}>Late fee</Text>
                  <Text style={[s.pStatVal, { color: C.red }]}>PHP {PENALTY_PER_DAY}/day</Text>
                </View>
              </View>
              <View style={s.previewDue}>
                <Ionicons name="flag-outline" size={11} color={C.amber} />
                <Text style={s.previewDueTxt}>Due on: {fmtFull(previewDueIso)}</Text>
              </View>
            </View>
          )}

          <Text style={s.inputLbl}>BORROWER NAME</Text>
          <View style={s.inputWrap}>
            <Ionicons name="person-outline" size={15} color={C.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.inputField}
              placeholder="Enter full name"
              placeholderTextColor={C.muted}
              value={borrowerName}
              onChangeText={onChangeName}
              autoFocus
            />
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnConfirm, !borrowerName.trim() && s.btnOff]}
              onPress={onConfirm}
              disabled={!borrowerName.trim()}
            >
              <Ionicons name="checkmark-circle-outline" size={15} color="#fff" style={{ marginRight: 5 }} />
              <Text style={s.btnConfirmTxt}>Confirm Borrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
