import React, { Component } from 'react';
import { Text, Image, View, ListView, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

class ScrollViewExample extends Component {


    state = {
       names: [
          {'name': 'Ben', 'id': 1},
          {'name': 'Susan', 'id': 2},
          {'name': 'Robert', 'id': 3},
          {'name': 'Mary', 'id': 4},
          {'name': 'Daniel', 'id': 5},
          {'name': 'Laura', 'id': 6},
          {'name': 'John', 'id': 7},
          {'name': 'Debra', 'id': 8},
          {'name': 'Aron', 'id': 9},
          {'name': 'Ann', 'id': 10},
          {'name': 'Steve', 'id': 11},
          {'name': 'Olivia', 'id': 12}
       ]
    }

    render() {
       return (
          <ListView>
            style={styles.container}
            dataSource={this.state.names}
            renderRow={(data) => <View>
                                    <Text>{data.name}</Text>
                                 </View>
                        }
          </ListView>
       )
    }
 }
 export default ScrollViewExample
 
 const styles = StyleSheet.create ({
    item: {
       flexDirection: 'row',
       justifyContent: 'center',
       alignItems: 'center',
       padding: 30,
       margin: 2,
       borderColor: '#2a4944',
       borderWidth: 1,
       backgroundColor: '#d2f7f1'
    }
 })


//  <ScrollView>
//                 {
//                    this.state.names.map((item, index) => (
                      

//                       <TouchableOpacity
//                         key = {item.id}
//                         // style = {styles.container}
//                         onPress = {() => console.log(item.id)}>
//                         <View >
//                            <Text style = {styles.item}>
//                               {item.name}
//                            </Text>
//                         </View>
//                      </TouchableOpacity>

//                    ))
//                 }
//              </ScrollView>