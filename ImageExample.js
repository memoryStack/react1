import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import  Image  from 'react-native'


const image = () =>  { 
            return(
                <Image source = {require('/Users/300067724/Desktop/MyReactNative/eagle.jpg')}
                style = {styles.container} /> )
        }


export default image;

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 200,
    }
});
