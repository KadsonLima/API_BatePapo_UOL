function messagePrivate(mensagens, usuario, limit){

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
if(!limit){

    return mensagensFiltradas;

}else{
    return mensagensFiltradas.slice(0, limit)
}


}

export {messagePrivate};