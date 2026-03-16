import React, { useState, useEffect } from 'react';
import {
  Text, View, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { C, PENALTY_PER_DAY, BORROW_DAYS, STORAGE_KEY } from './constants/theme';
import { CD, BorrowRecord } from './types';
import { daysLeft, calcPenalty, isOverdue, fmtShort, fmtFull } from './utils/helpers';
import { s } from './styles';
import { DueBadge } from './components/DueBadge';
import { Divider } from './components/Divider';
import { BorrowModal } from './components/BorrowModal';
import { ReturnModal } from './components/ReturnModal';

const INITIAL_INVENTORY: CD[] = [
  { id: '1', title: 'Midnights', artist: 'Taylor Swift', copies: 3 },
  { id: '2', title: 'Hybrid Theory', artist: 'Linkin Park', copies: 1 },
  { id: '3', title: 'Thriller', artist: 'Michael Jackson', copies: 5 },
  { id: '4', title: 'Back in Black', artist: 'AC/DC', copies: 2 },
  { id: '5', title: 'The Dark Side of the Moon', artist: 'Pink Floyd', copies: 2 },
];

export default function App() {
  const [inventory, setInventory] = useState<CD[]>(INITIAL_INVENTORY);
  const [borrowedList, setBorrowedList] = useState<BorrowRecord[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [lifetimeBorrows, setLifetimeBorrows] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  const [borrowModal, setBorrowModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [selectedCD, setSelectedCD] = useState<CD | null>(null);
  const [selectedRec, setSelectedRec] = useState<BorrowRecord | null>(null);
  const [borrowerName, setBorrowerName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.inventory) setInventory(d.inventory);
          if (d.borrowedList) setBorrowedList(d.borrowedList);
          if (d.totalIncome !== undefined) setTotalIncome(d.totalIncome);
          if (d.lifetimeBorrows !== undefined) setLifetimeBorrows(d.lifetimeBorrows);
        }
      } catch {
        Alert.alert('Error', 'Could not load saved data.');
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ inventory, borrowedList, totalIncome, lifetimeBorrows })
    ).catch(() => Alert.alert('Error', 'Could not save data.'));
  }, [inventory, borrowedList, totalIncome, lifetimeBorrows, loaded]);

  const openBorrowModal = (cd: CD) => {
    if (cd.copies <= 0) {
      Alert.alert('CD Not Available', 'Sorry, there are no copies of this CD available for borrowing.');
      return;
    }
    setSelectedCD(cd);
    setBorrowerName('');
    setBorrowModal(true);
  };

  const closeBorrowModal = () => {
    setBorrowModal(false);
    setBorrowerName('');
    setSelectedCD(null);
  };

  const confirmBorrow = () => {
    if (!selectedCD) return;
    if (!borrowerName.trim()) {
      Alert.alert('Required', "Please enter the borrower's name.");
      return;
    }
    if (selectedCD.copies <= 0) {
      Alert.alert('CD Not Available', 'Sorry, there are no copies of this CD available.');
      setBorrowModal(false);
      return;
    }

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + BORROW_DAYS);

    const record: BorrowRecord = {
      borrowId: Date.now().toString(),
      cdId: selectedCD.id,
      title: selectedCD.title,
      artist: selectedCD.artist,
      borrower: borrowerName.trim(),
      borrowDate: now.toISOString(),
      dueDate: due.toISOString(),
    };

    setInventory(prev => prev.map(c => c.id === selectedCD.id ? { ...c, copies: c.copies - 1 } : c));
    setBorrowedList(prev => [...prev, record]);
    setLifetimeBorrows(prev => prev + 1);
    closeBorrowModal();
  };

  const openReturnModal = (rec: BorrowRecord) => {
    setSelectedRec(rec);
    setReturnModal(true);
  };

  const closeReturnModal = () => {
    setReturnModal(false);
    setSelectedRec(null);
  };

  const confirmReturn = () => {
    if (!selectedRec) return;

    const penalty = calcPenalty(selectedRec.dueDate);
    const days = Math.abs(Math.min(0, daysLeft(selectedRec.dueDate)));

    setInventory(prev => prev.map(c => c.id === selectedRec.cdId ? { ...c, copies: c.copies + 1 } : c));
    setBorrowedList(prev => prev.filter(b => b.borrowId !== selectedRec.borrowId));
    setTotalIncome(prev => prev + penalty);
    closeReturnModal();

    if (penalty > 0) {
      Alert.alert(
        'Late Return',
        `CD returned successfully.\n\nPenalty collected: PHP ${penalty.toFixed(2)}\n${days} day(s) overdue @ PHP ${PENALTY_PER_DAY}/day`
      );
    } else {
      Alert.alert('Returned On Time', 'CD returned successfully. No penalty applied.');
    }
  };

  const overdueList = borrowedList.filter(b => isOverdue(b.dueDate));
  const overdueCount = overdueList.length;
  const pendingPenalty = overdueList.reduce((sum, b) => sum + calcPenalty(b.dueDate), 0);
  const sortedBorrowed = [...borrowedList].sort((a, b) => daysLeft(a.dueDate) - daysLeft(b.dueDate));

  const returnPenalty = selectedRec ? calcPenalty(selectedRec.dueDate) : 0;
  const returnDays = selectedRec ? Math.abs(Math.min(0, daysLeft(selectedRec.dueDate))) : 0;
  const returnOverdue = selectedRec ? isOverdue(selectedRec.dueDate) : false;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconWrap}>
            <Ionicons name="disc" size={18} color={C.teal} />
          </View>
          <View>
            <Text style={s.headerTitle}>CD Manager</Text>
            <Text style={s.headerSub}>Inventory & Borrowing</Text>
          </View>
        </View>
        {overdueCount > 0 && (
          <View style={s.overduePill}>
            <Ionicons name="alert-circle" size={11} color={C.red} />
            <Text style={s.overduePillTxt}>{overdueCount} overdue</Text>
          </View>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderTopColor: C.teal }] }>
            <View style={[s.statIcoWrap, { backgroundColor: C.tealLight }] }>
              <Ionicons name="cash-outline" size={16} color={C.teal} />
            </View>
            <Text style={s.statLbl}>Total Income</Text>
            <Text style={[s.statVal, { color: C.teal }]}>PHP {totalIncome.toFixed(2)}</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: C.orange }] }>
            <View style={[s.statIcoWrap, { backgroundColor: C.orangeLight }] }>
              <Ionicons name="albums-outline" size={16} color={C.orange} />
            </View>
            <Text style={s.statLbl}>Total Borrows</Text>
            <Text style={[s.statVal, { color: C.orange }]}>{lifetimeBorrows}</Text>
          </View>
        </View>

        {overdueCount > 0 && (
          <View style={s.warnBanner}>
            <Ionicons name="warning-outline" size={14} color={C.amber} />
            <Text style={s.warnBannerTxt}>
              {overdueCount} overdue borrow{overdueCount > 1 ? 's' : ''} · PHP {pendingPenalty} pending penalty
            </Text>
          </View>
        )}

        <View style={s.secRow}>
          <Ionicons name="disc-outline" size={13} color={C.teal} />
          <Text style={s.secTitle}>Available Inventory</Text>
          <View style={[s.secPill, { backgroundColor: C.tealLight }] }>
            <Text style={[s.secPillTxt, { color: C.teal }]}>{inventory.length} titles</Text>
          </View>
        </View>

        <View style={s.tableCard}>
          <View style={s.tableHead}>
            <Text style={[s.thTxt, { flex: 1 }]}>Title / Artist</Text>
            <Text style={[s.thTxt, { width: 52, textAlign: 'center' }]}>Stock</Text>
            <Text style={[s.thTxt, { width: 82, textAlign: 'center' }]}>Action</Text>
          </View>

          {inventory.map((cd, i) => {
            const avail = cd.copies > 0;
            const sColor = cd.copies === 0 ? C.red : cd.copies === 1 ? C.amber : C.teal;
            const sBg = cd.copies === 0 ? C.redLight : cd.copies === 1 ? C.amberLight : C.tealLight;
            const total = cd.copies + borrowedList.filter(b => b.cdId === cd.id).length;

            return (
              <View key={cd.id}>
                {i > 0 && <Divider />}
                <View style={s.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cdTitle}>{cd.title}</Text>
                    <Text style={s.cdArtist}>{cd.artist}</Text>
                  </View>
                  <View style={{ width: 52, alignItems: 'center' }}>
                    <View style={[s.stockTag, { backgroundColor: sBg, borderColor: sColor + '66' }] }>
                      <Text style={[s.stockTxt, { color: sColor }]}>{cd.copies}/{total}</Text>
                    </View>
                  </View>
                  <View style={{ width: 82, alignItems: 'center' }}>
                    {avail ? (
                      <TouchableOpacity style={s.borrowBtn} onPress={() => openBorrowModal(cd)} activeOpacity={0.75}>
                        <Ionicons name="arrow-down-circle-outline" size={12} color="#fff" />
                        <Text style={s.borrowBtnTxt}>Borrow</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={s.borrowBtnNone}
                        onPress={() => Alert.alert('CD Not Available', 'Sorry, there are no copies of this CD available for borrowing.')}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="close-circle-outline" size={12} color={C.red} />
                        <Text style={s.borrowBtnNoneTxt}>None</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={s.secRow}>
          <Ionicons name="swap-horizontal-outline" size={13} color={C.orange} />
          <Text style={[s.secTitle, { color: C.orange }]}>Currently Borrowed</Text>
          {borrowedList.length > 0 && (
            <View style={[s.secPill, { backgroundColor: C.orangeLight }] }>
              <Text style={[s.secPillTxt, { color: C.orange }]}>{borrowedList.length}</Text>
            </View>
          )}
        </View>

        {borrowedList.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={38} color={C.muted} />
            <Text style={s.emptyTitle}>All clear!</Text>
            <Text style={s.emptySub}>No CDs currently borrowed.</Text>
          </View>
        ) : (
          sortedBorrowed.map(rec => {
            const penalty = calcPenalty(rec.dueDate);
            const ov = isOverdue(rec.dueDate);
            return (
              <View key={rec.borrowId} style={[s.borrowCard, ov && s.borrowCardRed]}>
                <View style={[s.stripe, { backgroundColor: ov ? C.red : C.teal }] } />
                <View style={s.borrowBody}>
                  <View style={s.borrowTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.borrowTitle} numberOfLines={1}>{rec.title}</Text>
                      <Text style={s.borrowArtist}>{rec.artist}</Text>
                    </View>
                    <DueBadge dueDate={rec.dueDate} />
                  </View>

                  <View style={s.infoBlock}>
                    <View style={s.infoRow}>
                      <Ionicons name="person-outline" size={11} color={C.muted} />
                      <Text style={s.infoLbl}>Borrower</Text>
                      <Text style={s.infoVal}>{rec.borrower}</Text>
                    </View>
                    <View style={s.infoRow}>
                      <Ionicons name="calendar-outline" size={11} color={C.muted} />
                      <Text style={s.infoLbl}>Borrow date</Text>
                      <Text style={s.infoVal}>{fmtShort(rec.borrowDate)}</Text>
                    </View>
                    <View style={s.infoRow}>
                      <Ionicons name="flag-outline" size={11} color={ov ? C.red : C.muted} />
                      <Text style={s.infoLbl}>Due date</Text>
                      <Text style={[s.infoVal, ov && { color: C.red, fontWeight: '700' }]}>
                        {fmtFull(rec.dueDate)}
                      </Text>
                    </View>
                    {penalty > 0 && (
                      <View style={s.infoRow}>
                        <Ionicons name="cash-outline" size={11} color={C.red} />
                        <Text style={s.infoLbl}>Penalty</Text>
                        <Text style={[s.infoVal, { color: C.red, fontWeight: '700' }] }>
                          PHP {penalty} ({Math.abs(daysLeft(rec.dueDate))}d x PHP {PENALTY_PER_DAY}/day)
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity style={[s.returnBtn, ov && s.returnBtnRed]} onPress={() => openReturnModal(rec)} activeOpacity={0.8}>
                    <Ionicons name="arrow-up-circle-outline" size={14} color="#fff" />
                    <Text style={s.returnBtnTxt}>{ov ? `Return  ·  PHP ${penalty} penalty` : 'Return CD'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <BorrowModal
        visible={borrowModal}
        selectedCD={selectedCD}
        borrowerName={borrowerName}
        onClose={closeBorrowModal}
        onChangeName={setBorrowerName}
        onConfirm={confirmBorrow}
      />

      <ReturnModal
        visible={returnModal}
        selectedRec={selectedRec}
        returnOverdue={returnOverdue}
        returnPenalty={returnPenalty}
        returnDays={returnDays}
        onClose={closeReturnModal}
        onConfirm={confirmReturn}
      />
    </SafeAreaView>
  );
}
