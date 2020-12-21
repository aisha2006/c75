import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,TextInput, Alert,KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as firebase from 'firebase';
import db from '../config';

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermission: null,
            scanned: false,
            ButtonState:'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: '',
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

    initiateBookIssue=async ()=>{
      //adding a transaction - type
      db.collection("transaction").add({
        studentId: this.state.scannedStudentId,
        bookId: this.state.scannedBookId,
        date:firebase.firestore.Timestamp.now().toDate(),
        transactionType:"issue"
      });

      //Changing book status
      db.collection("Books").doc(this.state.scannedBookId).update({
        bookAvailability:false
      });
      
      //Changing no of book issued by the student
      db.collection("students").doc(this.state.scannedStudentId).update({
        noOfBooksIssued:firebase.firestore.FieldValue.increment(1)
      })

      Alert.alert("Book Issued");

      //Change state of data back to null
      this.setState({scannedBookId:"",scannedStudentId:""});
    }

    initiateBookReturn=async ()=>{
      //adding a transaction - type
      db.collection("transaction").add({
        studentId: this.state.scannedStudentId,
        bookId: this.state.scannedBookId,
        date:firebase.firestore.Timestamp.now().toDate(),
        transactionType:"return"
      });

      //Changing book status
      db.collection("Books").doc(this.state.scannedBookId).update({
        bookAvailability:true
      });
      
      //Changing no of book issued by the student
      db.collection("students").doc(this.state.scannedStudentId).update({
        noOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
      })

      Alert.alert("Book Returned");

      //Change state of data back to null
      this.setState({scannedBookId:"",scannedStudentId:""});
    }

    handleTransaction=()=>{
      var transactionMessage=null;
      db.collection("Books").doc(this.state.scannedBookId).get()
      .then((doc)=>{
        var book=doc.data();

        if(book.bookAvailability){
          this.initiateBookIssue();
          transactionMessage = 'Book Issued';
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
        }

        else{
          this.initiateBookReturn();
          transactionMessage = "Book Returned";
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);       
        }
        
         this.setState({transactionMessage:transactionMessage});
      });
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
        return(
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
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
                onChangeText = {text => this.setState({scannedBookId: text})}
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
                onChangeText={text=>this.setState({scannedStudentId: text})}
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
            
            <TouchableOpacity style={styles.submitButton} onPress={async()=>{
              var transactionMessage=this.handleTransaction();
              this.setState({scannedStudentId:'',scannedBookId:''});
            }}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
      
      );
    }
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
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });

