import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Phone, MessageCircle, Mail, ChevronDown,
  ChevronRight, Headphones, Send, AlertCircle, HelpCircle
} from 'lucide-react-native';

const FAQS = [
  {
    id: '1',
    q: 'How do I pay my rent?',
    a: 'Go to Payments → tap "Pay Now". You can pay via UPI, Net Banking, or Credit/Debit card. A receipt is auto-generated after payment.'
  },
  {
    id: '2',
    q: 'How do I raise a maintenance complaint?',
    a: 'Go to Complaints from the home menu, fill in the title and description, then tap Submit. The PG manager will be notified and update the status.'
  },
  {
    id: '3',
    q: 'How do I download my rent receipt?',
    a: 'Go to Invoices & Receipts from the home menu. Tap on any month to expand it and tap "Download PDF Receipt".'
  },
  {
    id: '4',
    q: 'How do I update my profile or ID documents?',
    a: 'Go to Profile → tap "Edit Profile". You can update your photo, phone number, and upload documents like Aadhaar or PAN.'
  },
  {
    id: '5',
    q: 'How do I request to leave the PG?',
    a: 'Go to My Stay → tap "Leave Request". Fill in your vacating date and reason. The manager will confirm your notice period.'
  },
  {
    id: '6',
    q: 'What happens if I miss a rent payment?',
    a: 'A late fee may be applied after the due date. Contact your PG manager immediately via the Support section if you need an extension.'
  },
];

export default function SupportScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleCall = () => Linking.openURL('tel:+919876543210');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/919876543210?text=Hello%2C%20I%20need%20help%20with%20my%20PG%20stay.');
  const handleEmail = () => Linking.openURL('mailto:support@pgmanager.in?subject=PG%20Support%20Request');
  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Empty', 'Please write your message before sending.');
      return;
    }
    Alert.alert('Sent!', 'Your message has been sent to the support team. We\'ll respond within 24 hours.');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>We're here to help you 24/7</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* CONTACT CARDS */}
        <Text style={styles.sectionTitle}>Contact Your PG Manager</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#E8F0FE' }]} onPress={handleCall}>
            <View style={[styles.contactIconBg, { backgroundColor: '#3478F6' }]}>
              <Phone size={20} color="#FFF" />
            </View>
            <Text style={[styles.contactLabel, { color: '#4536C9' }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#E5F6EC' }]} onPress={handleWhatsApp}>
            <View style={[styles.contactIconBg, { backgroundColor: '#1FA45A' }]}>
              <MessageCircle size={20} color="#FFF" />
            </View>
            <Text style={[styles.contactLabel, { color: '#1FA45A' }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#FCEAEA' }]} onPress={handleEmail}>
            <View style={[styles.contactIconBg, { backgroundColor: '#E4484D' }]}>
              <Mail size={20} color="#FFF" />
            </View>
            <Text style={[styles.contactLabel, { color: '#E4484D' }]}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* SEND A MESSAGE */}
        <Text style={styles.sectionTitle}>Send a Message</Text>
        <View style={styles.messageCard}>
          <TextInput
            placeholder="Describe your issue or question..."
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            placeholderTextColor="#9B9DAC"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={16} color="#FFF" />
            <Text style={styles.sendBtnText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQS.map(faq => {
          const isOpen = expandedFaq === faq.id;
          return (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(isOpen ? null : faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <HelpCircle size={16} color="#5B4FE5" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <ChevronDown
                  size={18}
                  color="#9B9DAC"
                  style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                />
              </View>
              {isOpen && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* SUPPORT INFO */}
        <View style={styles.supportInfoCard}>
          <Headphones size={20} color="#5B4FE5" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.supportInfoTitle}>PG Support Team</Text>
            <Text style={styles.supportInfoSub}>Available Mon–Sat, 9 AM – 8 PM</Text>
            <Text style={styles.supportInfoSub}>support@pgmanager.in</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },

  header: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

  scrollContent: { padding: 16 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16181D',
    marginBottom: 12,
    marginTop: 8,
  },

  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: { fontSize: 13, fontWeight: '700' },

  messageCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ECEBF3',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#16181D',
    minHeight: 100,
    marginBottom: 10,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B4FE5',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  sendBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#16181D',
    lineHeight: 20,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6F7282',
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4F3F9',
  },

  supportInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1ECFD',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1ECFD',
    marginTop: 8,
  },
  supportInfoTitle: { fontSize: 14, fontWeight: '700', color: '#4536C9', marginBottom: 3 },
  supportInfoSub: { fontSize: 12, color: '#4536C9' },
});
