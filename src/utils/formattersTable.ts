import dayjs from 'dayjs';

export function formatterQtd(value: number): string {
    return value.toLocaleString('pt-BR');
};

export function formatterReal(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export function formatterPercent(value: number): string {
    return (value * 100).toFixed(2) + '%';
};

export function formatterDate(date: string | Date): string {
    return dayjs(date).format('DD/MM/YYYY');
};