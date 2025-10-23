# Componente BonusChest

## Descrição
Componente reutilizável para baús de bônus na trilha de missões. Permite que o usuário abra baús apenas uma vez, desde que tenha completado as missões necessárias.

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `chestId` | string | ✅ | ID único do baú |
| `points` | number | ✅ | Quantidade de pontos de bônus |
| `requiredMissions` | string[] | ✅ | Array com IDs das missões necessárias para desbloquear o baú |
| `onChestOpened` | (points: number) => void | ❌ | Callback executado quando o baú é aberto |
| `isLocked` | boolean | ❌ | Força o baú a ficar bloqueado (opcional) |
| `style` | any | ❌ | Estilos customizados |

## Exemplo de Uso

```tsx
import BonusChest from '../components/BonusChest';

// Baú básico
<BonusChest 
  chestId="chest_1"
  points={10}
  requiredMissions={['profile', 'quiz2']}
/>

// Baú com callback
<BonusChest 
  chestId="chest_2"
  points={20}
  requiredMissions={['profile', 'quiz2', 'mission3']}
  onChestOpened={(points) => {
    console.log(`Usuário ganhou ${points} pontos!`);
  }}
/>

// Baú bloqueado manualmente
<BonusChest 
  chestId="chest_3"
  points={15}
  requiredMissions={[]}
  isLocked={true}
/>
```

## Funcionalidades

- ✅ **Abertura única**: Cada baú só pode ser aberto uma vez
- ✅ **Verificação de missões**: Só permite abrir se as missões necessárias foram completadas
- ✅ **Integração com backend**: Atualiza pontos do usuário automaticamente
- ✅ **Estados visuais**: Mostra diferentes estados (disponível, bloqueado, aberto)
- ✅ **Reutilizável**: Pode ser usado em qualquer parte da aplicação

## Estados do Baú

1. **Disponível**: Baú pode ser aberto (cor laranja, ícone de baú)
2. **Bloqueado**: Missões necessárias não foram completadas (cor cinza, ícone de cadeado)
3. **Aberto**: Baú já foi resgatado (cor verde, ícone de check)

## Integração com Backend

O componente faz uma requisição POST para `/api/missions/open-chest` com:
```json
{
  "chestId": "chest_1",
  "points": 10
}
```

O backend retorna:
```json
{
  "message": "Baú aberto! Você ganhou 10 pontos de bônus!",
  "user": { /* dados atualizados do usuário */ },
  "pointsAwarded": 10
}
```
