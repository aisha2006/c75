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
        transactionType:"Issue"
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
        transactionType:"Return"
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

    checkBookEligibility=async()=>{
      const booksRef= await db.collection("Books").where("bookId","==","this.state.scannedBookId").get()
      var transactionType = "";
      //if book  does not exist in db
      if(booksRef.docs.length===0){
        transactionType=false;
      }

      else{
        booksRef.docs.map((doc)=>{
           var book = doc.data();
           if(book.bookAvailability){
             transactionType="Issue";
           }

           else{
             transactionType="Return";
           }
        });
      
      }
      return transactionType;
    }

    checkStudentEligibilityForBookIssue=async()=>{
      const studentRef= await db.collection("students").where("studentId","==","this.state.scannedStudentId").get()
      var isStudentEligible = "";
      //if student does not exist in db
      if(studentRef.docs.length===0){
        this.setState({scannedBookId:"",scannedStudentId:""});
        isStudentEligible=false;
        Alert.alert("student does not exist in the database")
      }

      else{
        studentRef.docs.map((doc)=>{
           var student = doc.data();
           if(student.noOfBooksIssued<2){
             isStudentEligible=true;
           }

           else{
             isStudentEligible=false;
             Alert.alert("student has taken maximum number of books");
             this.setState({scannedBookId:"",scannedStudentId:""});
           }
        });
      
      }
      return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn=async()=>{
      const transactionRef= await db.collection("transaction").where("bookId","==","this.state.scannedBookId").limit(1).get()
      var isStudentEligible = "";
      
        transactionRef.docs.map((doc)=>{
           var lastBookTransaction = doc.data();
           if(lastBookTransaction.studentId===this.state.scannedStudentId){
             isStudentEligible=true;
           }

           else{
             isStudentEligible=false;
             Alert.alert("book was not issued by this student");
             this.setState({scannedBookId:"",scannedStudentId:""});
           }
        });
      
      return isStudentEligible;
    }

  

    handleTransaction=async ()=>{
      var transactionMessage=null;
      var transactionType = await this.checkBookEligibility();

      if(!transactionType){
        Alert.alert("this book does not exist in the database");
        this.setState({scannedBookId:"",scannedStudentId:""});
      }

      else if(transactionType==="Issue"){
         var isStudentEligible= await this.checkStudentEligibilityForBookIssue();

         if(isStudentEligible){
           this.initiateBookIssue();
           Alert.alert("book issued!")
         }
      }

      else{
        var isStudentEligible= await this.checkStudentEligibilityForBookReturn();

        if(isStudentEligible){
          this.initiateBookReturn();
          Alert.alert("book returned to the library!")
        }
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

