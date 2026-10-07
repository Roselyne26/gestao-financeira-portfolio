function calcularResumo(lancamentos) {
  return lancamentos.reduce(
    (acumulado, lancamento) => {
      const valor = Number(lancamento.valor) || 0;

      if (lancamento.tipo === 'entrada') {
        acumulado.totalEntradas += valor;
        acumulado.saldo += valor;
      } else {
        acumulado.totalSaidas += valor;
        acumulado.saldo -= valor;
      }

      return acumulado;
    },
    {
      saldo: 0,
      totalEntradas: 0,
      totalSaidas: 0,
    }
  );
}

module.exports = {
  calcularResumo,
};
