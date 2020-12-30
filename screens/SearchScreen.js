import React from 'react';
import { StyleSheet, Text, View,FlatList,TextInput,TouchableOpacity } from 'react-native';
import db from '../config'
import {ScrollView} from 'react-native-gesture-handler';

export default class SearchScreen extends React.Component{
    constructor(){
        super();
        this.state={
            allTransactions:[],
            lastVisibleTransaction:null,
            search:""
        }
    }

    fetchMoreTransactions=async()=>{
        var text = this.state.search.toUpperCase()
        var enteredText=text.split("")
        if(enteredText[0].toUpperCase()==="B"){
           const query = await db.collection("transaction").where("bookId","==", text ).startAfter(this.state.lastVisibleTransaction).limit(10).get()
           query.docs.map(()=>{
               this.setState({
                   allTransactions:[...this.state.allTransactions, doc.data()],
                   lastVisibleTransaction:doc
                 });
                   
           });
        }
 
        else if(enteredText[0].toUpperCase()==="S"){
             const query = await db.collection("transaction").where("studentId","==", text ).startAfter(this.state.lastVisibleTransaction).limit(10).get()
             query.docs.map(()=>{
                 this.setState({
                     allTransactions:[...this.state.allTransactions, doc.data()],
                     lastVisibleTransaction:doc
                 });
             });
         
         }     
    }

    searchTransactions=async(text)=>{
       var enteredText=text.split("")
       var text = text.toUpperCase()
       if(enteredText[0].toUpperCase()==="B"){
          const transaction = await db.collection("transaction").where("bookId","==", text ).get()
          transaction.docs.map(()=>{
              this.setState({
                  allTransactions:[...this.state.allTransactions, doc.data()],
                  lastVisibleTransaction:doc
                });
                  
          });
       }

       else if(enteredText[0].toUpperCase()==="S"){
            const transaction = await db.collection("transaction").where("studentId","==", text ).get()
            transaction.docs.map(()=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction:doc
                });
            });
        
        }
    }

    componentDidMount=async()=>{
        const query =await db.collection("transaction").get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions, doc.data()]
            })
        })
    }
 
    
 
    render(){
      return(
        <View style={styles.container}>

            <View style={styles.stylesBar}>
                <TextInput
                placeholder={"studentId or bookId"}
                onChangeText={(text)=>{
                    this.setState({search:text})
                }}
                />
                <TouchableOpacity style={styles.searchButton}
                onPress={()=>{this.searchTransactions(this.state.search)}}>
                    <Text style={styles.bar}>Search</Text>

                </TouchableOpacity>                
            </View>
        
            <FlatList
            
                    //Return a view which contains one item in a list
                data = {this.state.allTransactions}
                renderItem = {({item})=>(
                    <View style={{borderBottomWidth:2}}>
                        <Text>
                            {"Transaction Type: " + item.transactionType}
                        </Text>

                        <Text>
                            {"Book Id: " + item.bookId}
                        </Text>

                        <Text>
                            {"Student Id: "+item.studentId}
                        </Text>

                        <Text>
                            {"Date: " + item.date.toDate()}
                        </Text>
                    </View>

                )}
                keyExtractor = {(item,index)=>index.toString()}
                onEndReached={this.fetchMoreTransactions}
                onEndReachedThreshold = {0.7}
            />
        </View>
      );
  }
  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar: {
        borderWidth:2,
        height:30,
        width:300,
        paddingLeft:10,
    },
    
});