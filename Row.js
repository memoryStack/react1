import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';



const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});




Row = (rowData, sectionId, rowId) => {
    
    return (
        <View style={styles.rowContainer} >
            <Image source={{ uri: rowData.picture.large}} style={styles.photo} />
            <Text style={styles.text}>
            {`${rowData.name.first} ${rowData.name.last}`}
            </Text>
        </View>
    );
  };

export default Row;

