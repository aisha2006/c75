import React from 'react';
import { StyleSheet, Text, View,Alert,TextInput,TouchableOpacity,KeyboardAvoidingView,Image, Alert } from 'react-native';
import firebase from 'react-native-firebase';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailId:"",
            password:""
        }
    }

    login=async (email,password)=>{
       if(email && password){
         try{
           const response = await firebase.auth().signInWithEmailAndPassword(email,password)
           if(response){
               this.props.navigation.navigate("Transaction")
           }
         }

         catch(error){
           switch(error.code){
               case "auth/user-not-found": Alert.alert("user does not exist");
                    break;
               case "auth/invalid-email": Alert.alert("incorrect email or password")     
           }
         }
       }

       else{
           Alert.alert("enter email and password")
       }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:"center",margintop:20}}>
                <View>
                    <Image
                    source={require("../assets/booklogo.jpg")}
                    style={{width:200,height:200}}/>
                    <Text style={{textAlign:'center',fontSize:30}} >Wily App</Text>
                </View>
                
                <View>
                    <TextInput 
                        style={styles.loginBox}
                        placeholder="xyz@mail.com"
                        keyboardType="email-address"
                        onChange={(text)=>{
                            this.setState({emailId:text})
                        }}
                        />
                        
                    <TextInput
                        style={styles.loginBox}
                        secureTextEntry = {true}
                        placeholder="enter password"
                        onChange={(text)=>{
                            this.setState({password:text})
                        }}
                    />
                </View>

                <View>
                    <TouchableOpacity style={styles.loginButton}
                      onPress={()=>{this.login(this.state.emailId,this.state.password)}}
                    >
                       <Text style={{textAlign:"center"}}>login</Text>    
                    </TouchableOpacity>
                </View>    
            
            </KeyboardAvoidingView>
        )
    }
}









const styles = StyleSheet.create({
    loginBox: {
        width: 300,
        height: 40,
        borderWidth: 1.5,
        fontSize: 20,
        margin: 10,
        paddingLeft:10
    },

    loginButton: {
        height: 30,
        width: 90,
        borderWidth: 1,
        marginTop: 20,
        paddingTop: 5,
        borderRadius: 7
    }
});