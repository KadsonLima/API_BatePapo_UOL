function messagePrivate(mensagens, usuario){

    let mensagensFiltradas = [];


   mensagens.map(e=>{
    if(e.type == 'private_message'){
        if(e.to == usuario || e.from == usuario){
            mensagensFiltradas.push(e);
        }
    }else{
         mensagensFiltradas.push(e) ;
    }
    
})
return mensagensFiltradas;


}

export {messagePrivate};