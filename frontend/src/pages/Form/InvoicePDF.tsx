import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import logo from '../../images/cslogo.jpg';
import { toWords } from 'number-to-words';

type SubParticular = {
  description: string;
  amount: string;
};

type Particular = {
  description: string;
  subParticulars: SubParticular[];
  total: string;
};

type FormData = {
  company: string;
  invoiceNo: string;
  invoiceDate: string;
  particulars: Particular[];
  total: string;
};

type InvoicePDFProps = {
  formData: FormData;
};

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 20,
  },
  logo: { width: 100, height: 70 },
  companyName: { fontSize: 20, fontWeight: 'bold', color: '#001f60' },
  companySubtitle: { fontSize: 12, color: '#001f60' },
  invoiceDetails: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsColumn: { alignItems: 'flex-start' },
  detailsColumnRight: { alignItems: 'flex-end' },
  row: {
    flexDirection: 'row',
    gap: 5, // Adjust spacing between label and value
  },

  label: { fontSize: 12, fontWeight: 'bold' },
  particularheadinglabel: { fontSize: 12, fontWeight: 'extralight' },
  value: { fontSize: 12, marginBottom: 5 },
  particularsSection: {
    flex: 1,
    borderWidth: 1,
    borderTopWidth: 2,
    borderColor: '#000',
    paddingTop: 10, // Keep padding at the top
    paddingBottom: 10, // Keep padding at the bottom
    paddingLeft: 0, // Remove left padding
    paddingRight: 0, // Remove right padding
    marginVertical: 7,
    display: 'flex',
    justifyContent: 'space-between', // Ensure the contents fill the space
  },

  particularsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 6,
    marginBottom: 10,
  },
  particularsHeaderText: {
    fontSize: 12,
    fontWeight: 'extrabold',
    marginRight: '4%',
  },
  particularsHeaderTextp: {
    fontSize: 12,
    fontWeight: 'extrabold',
    marginLeft: '35%',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '80%',
    borderLeftWidth: 1,
    borderLeftColor: '#000',
  },
  particular: {
    marginBottom: 10,
    paddingTop: 0,
    paddingRight: 5,
    paddingLeft: 5,
  },
  subParticularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    marginTop: 5,
  },
  subParticularDescription: { flex: 3, fontSize: 10, textAlign: 'justify' },
  subParticularAmount: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  particularTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 5,
  },
  particularTotalText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 4,
  },
  particularTotalAmount: {
    fontSize: 12,
    fontWeight: 'heavy',
    textAlign: 'right',
    flex: 1,
  },
  totalsection: {
    marginTop: 'auto',
  },
  grandTotalContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000', // Adds horizontal line above total section
    paddingTop: 5,
  },
  grandTotalWords: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: -20,
    flexWrap: 'wrap', // Ensures the words wrap to the next line if too long
    marginLeft: 3,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    flexShrink: 0,
    marginRight: 5,
    marginTop: 8,
  },
  footer: {
    paddingTop: 7,
    fontSize: 8,
  },
  notes: { fontSize: 10, color: '#555', fontWeight: 'bold' },
  contactInfo: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#333333',
  },
  notedesc: {
    marginLeft: 20,
  },
});

const InvoicePDF: React.FC<InvoicePDFProps> = ({ formData }) => {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const particularAmounts = formData.particulars.map((p) => p.total);
  const grandTotalFormula = particularAmounts
    .map((_, index) => `[${alphabets[index]}]`)
    .join(' + ');
  const totalInWords = `${toWords(formData.total)} only`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>
              Chintan I. Patel & Associates
            </Text>
            <Text style={styles.companySubtitle}>Company Secretaries</Text>
          </View>
          <Image src={logo} style={styles.logo} />
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.detailsColumn}>
            <View style={styles.row}>
              <Text style={styles.label}></Text>
              <Text style={styles.value}></Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Company :</Text>
              <Text style={styles.value}>{formData.company}</Text>
            </View>
          </View>
          <View style={styles.detailsColumnRight}>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice No. :</Text>
              <Text style={styles.value}>{formData.invoiceNo}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Invoice Date :</Text>
              <Text style={styles.value}>{formData.invoiceDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.particularsSection}>
          <View style={styles.particularsHeader}>
            <Text style={styles.particularsHeaderTextp}>Particulars</Text>
            <Text style={styles.particularsHeaderText}>₹ Amount</Text>
          </View>
          <View style={styles.verticalLine} />
          {formData.particulars.map((particular, index) => (
            <View key={index} style={styles.particular}>
              <Text
                style={[styles.particularheadinglabel, { marginBottom: 5 }]}
              >{`[${alphabets[index]}] - ${particular.description}`}</Text>
              {particular.subParticulars.map((subParticular, subIndex) => (
                <View key={subIndex} style={styles.subParticularRow}>
                  <Text style={styles.subParticularDescription}>
                    {subParticular.description}
                  </Text>
                  <Text style={styles.subParticularAmount}>
                    {subParticular.amount}
                  </Text>
                </View>
              ))}
              <View style={styles.particularTotal}>
                <Text style={styles.particularTotalText}>
                  [{alphabets[index]}]
                </Text>
                <Text style={styles.particularTotalAmount}>
                  {particular.total}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalsection}>
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalWords}>
                {totalInWords.toUpperCase()} : {grandTotalFormula}
              </Text>
              <Text style={styles.grandTotal}>{formData.total}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.notes}>
            <Text style={{ fontWeight: 'bold' }}>
              For, Chintan I. Patel & Associates
            </Text>
            {'\n\n\n'}
            <Text style={{ fontWeight: 'bold' }}>Chintan Patel</Text>
            {'\n'}
            Proprietor{'\n'}
            <Text style={{ fontWeight: 'bold' }}>Notes:</Text>
            {'\n'}
            1. Issue cheque in favor of “Chintan I. Patel & Associates”
            {'\n'}
            2. UPI ID: 9909102529@kotak
            {'\n'}
            3. Banking detail for direct credit is as under:
            {'\n'}
            <Text style={styles.notedesc}>
              Beneficiary: Chintan I. Patel & Associates | Account No:
              9909102529 | IFSC: KKBK0002588 | MICR Code: 380485035 | Bank Name
              & address: Kotak Mahindra Bank, Kalpana Complex, Mamnagar Fire
              Station, Navrangpura, Ahmedabad
            </Text>
          </Text>
          <Text style={styles.contactInfo}>
            1205, Phoenix, Vijay Cross Road, Navrangpura, Ahmedabad - 380 009
            {'\n'}
            +91 99091 02529 | fcschintanpatel@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
