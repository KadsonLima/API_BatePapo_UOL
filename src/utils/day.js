import dayjs from 'dayjs';


function horarioAgora(){
    return dayjs().locale('pt-br').format("HH:mm:ss");
}

export {horarioAgora};