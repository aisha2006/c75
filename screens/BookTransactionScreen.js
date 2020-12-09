import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image } from 'react-native';
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermission: null,
            scanned: false,
            scannedData: '',
            ButtonState:'normal',
            scannedBookId: '',
            scannedStudentId: '',
        }
    }

    getCameraPermission=async(id)=>{
      const {status}=await Permissions.askAsync(Permissions.CAMERA);
      this.setState({
          hasCameraPermission:status==='granted',
          ButtonState:id,
          scanned:false
      })
    }

    handleBarCodeScanner=async(type,data)=>{
        const {buttonState} = this.state

        if(buttonState === "BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                ButtonState:'normal',
            })
        }

        else if(buttonState === "StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                ButtonState:'normal',
            })
        }
    }
  render(){
      const hasCameraPermission=this.state.hasCameraPermission;
      const scanned=this.state.scanned;
      const ButtonState=this.state.ButtonState;
      if(ButtonState!=='normal'&&hasCameraPermission){
          return(
              <BarCodeScanner
              onBarCodeScanned={
                  scanned?undefined:this.handleBarCodeScanner
              }
              style={StyleSheet.absoluteFillObject}
              />
          )
      }

      else if(ButtonState==='normal'){
        <View style={styles.container}>
            <View>
                <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200,height:200}}
                />
                <Text
                style={{textAlign: 'center', fontSize: 30}}>WIRELESS LIBRARY</Text>
            </View>
            <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder= "Book ID"
                value={this.state.scannedBookId}
                />
                <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{this.getCameraPermission('BookId')}}
                >
                    <Text
                    style={styles.buttonText}
                    >Scan</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder= "Student ID"
                value={this.state.scannedStudentId}
                />
                <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{this.getCameraPermission('StudentId')}}
                >
                    <Text
                    style={styles.buttonText}
                    >Scan</Text>
                </TouchableOpacity>
            </View>
        </View>
      }
      return(
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Text>
                  {hasCameraPermission===true?this.state.scannedData:'requestCameraPermission'}
              </Text>
              <TouchableOpacity
              onPress={()=>{
                  this.getCameraPermission();
              }}
              >
                  <Text>scan</Text>
              </TouchableOpacity>
          </View>
      );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });

