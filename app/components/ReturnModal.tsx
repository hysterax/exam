import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, PENALTY_PER_DAY } from '../constants/theme';
import { s } from '../styles';
import { fmtFull } from '../utils/helpers';
import { BorrowRecord } from '../types';

interface Props {
  visible:       boolean;
  selectedRec:   BorrowRecord | null;
  returnOverdue: boolean;
  returnPenalty: number;
  returnDays:    number;
  onClose:       () => void;
  onConfirm:     () => void;
}

export function ReturnModal({ visible, selectedRec, returnOverdue, returnPenalty, returnDays, onClose, onConfirm }: Props) {
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

          <View style={s.sheetHd}>
            <View style={[
              s.sheetHdIco,
              { backgroundColor: returnOverdue ? C.redLight : C.tealLight, borderColor: (returnOverdue ? C.red : C.teal) + '44' },
            ]}>
              <Ionicons name="arrow-up-circle-outline" size={20} color={returnOverdue ? C.red : C.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetTitle}>Return CD</Text>
              {selectedRec && (
                <Text style={s.sheetSub}>{selectedRec.title} · {selectedRec.artist}</Text>
              )}
            </View>
            <TouchableOpacity style={s.sheetClose} onPress={onClose}>
              <Ionicons name="close" size={17} color={C.slate} />
            </TouchableOpacity>
          </View>
          {selectedRec && (
            <View style={s.preview}>
              <View style={s.infoRow}>
                <Ionicons name="person-outline" size={11} color={C.muted} />
                <Text style={s.infoLbl}>Borrower</Text>
                <Text style={s.infoVal}>{selectedRec.borrower}</Text>
              </View>
              <View style={s.infoRow}>
                <Ionicons name="calendar-outline" size={11} color={C.muted} />
                <Text style={s.infoLbl}>Borrowed</Text>
                <Text style={s.infoVal}>{fmtFull(selectedRec.borrowDate)}</Text>
              </View>
              <View style={s.infoRow}>
                <Ionicons name="flag-outline" size={11} color={returnOverdue ? C.red : C.muted} />
                <Text style={s.infoLbl}>Due date</Text>
                <Text style={[s.infoVal, returnOverdue && { color: C.red, fontWeight: '700' }]}>
                  {fmtFull(selectedRec.dueDate)}
                </Text>
              </View>
              <View style={s.infoRow}>
                <Ionicons name="today-outline" size={11} color={C.muted} />
                <Text style={s.infoLbl}>Returning</Text>
                <Text style={s.infoVal}>{fmtFull(new Date().toISOString())}</Text>
              </View>
            </View>
          )}

          <View style={[
            s.penaltyBox,
            { backgroundColor: returnOverdue ? C.redLight : C.tealLight, borderColor: (returnOverdue ? C.red : C.teal) + '55' },
          ]}>
            <Ionicons
              name={returnOverdue ? 'alert-circle' : 'checkmark-circle'}
              size={24}
              color={returnOverdue ? C.red : C.teal}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[s.penaltyAmt, { color: returnOverdue ? C.red : C.teal }]}>
                {returnOverdue ? `PHP ${returnPenalty.toFixed(2)} penalty` : 'No penalty'}
              </Text>
              <Text style={s.penaltySub}>
                {returnOverdue
                  ? `${returnDays} day(s) overdue × PHP ${PENALTY_PER_DAY}/day`
                  : 'Returned on or before the due date'}
              </Text>
            </View>
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose}>
              <Text style={s.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnConfirm, { backgroundColor: returnOverdue ? C.red : C.teal }]}
              onPress={onConfirm}
            >
              <Ionicons name="checkmark-circle-outline" size={15} color="#fff" style={{ marginRight: 5 }} />
              <Text style={s.btnConfirmTxt}>Confirm Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
