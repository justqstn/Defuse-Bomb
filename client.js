// v -1.5
// Александр яйцо сосёт хуй
// функция создания команды
function addTeams(t, n, c, sp) {
	 let tm = Teams.Get(t);
     Teams.Add(t, n, { r: c.r / 255.0, g: c.g / 255.0, b: c.b / 255.0 });
     tm.Spawns.SpawnPointsGroups.Add(sp);
     return tm;
} 
// добавляем команды
var h = addTeams('human', '<size=17>ℌ</size><size=11>ꪊ</size><size=12>ꪑꪖꪀ</size> <size=14>☠</size>', { r: 0, g: 123, b: 167 }, 1);
var z = addTeams('zombie', '<size=17>ℨ</size><size=17>ℴ</size><size=12>ꪑ᥇</size>ℑℯ <size=14>☦</size>', { r: 45, g: 165, b: 155 }, 1);
// создаём таймера 
var m_Timer = Timers.GetContext().Get('main'), c_Timer = Timers.GetContext().Get('count'), w_Timer = Timers.GetContext().Get('win');
// переменные
var need = 0, props = Properties.GetContext(), s_Prop = props.Get('state'), waves = props.Get('waves'), s_Locker = props.Get('lock'), 
c = props.Get('c_d'), banned_id = props.Get('b_i'), zm_h = z.ContextedProperties.MaxHp;
// забаненные
banned_id.Value = '596D1288BD7F8CF7C002224F3666744D';
// опции режима
TeamsBalancer.IsAutoBalance = false;
// настройки зомби
z.ContextedProperties.SkinType.Value = 1,
z.ContextedProperties.InventoryType.Value = 1;
// события

// игрок присоединяется
Players.OnPlayerConnected.Add(function(p) { 
  // баним олухов
  if (banned_id.Value.search(p.id) != -1) { ban_P(p); }
});
// игрок выходит
Players.OnPlayerDisconnected.Add(function(p) { if (Players.Count < need) waitingMode(); });
// проперти игрока
Properties.OnPlayerProperty.Add(function(c, v) 
{   p = c.Player;
    // добавляем красивую хуйню 
    if (v.Name == 'M') p.Properties.Get('Visual').Value = p.Properties.Get('M').Value + '%';        
    // эсли у любого игрока мутация достигла 100 то заражаем
    if (p.Properties.Get('M').Value >= 100 && p.Team != z) z.Add(p), p.Ui.Hint.Value = 'следи за своей мутацией!', p.Timers.Get('Reset').Restart(4);      
});
// проперти команд
Properties.OnTeamProperty.Add(function(c, v) 
{   t = c.Team;
    // добавляем красивую хуйню 
    if (t == h && v.Name == 'alive_count' && t.Properties.Get('alive_count').Value < 1 && (s_Prop.Value == 'Infection' || s_Prop.Value == 'Swarm')) endMode(), Ui.GetContext().Hint.Value = 'зомби сьели всех!';
    else if (t == z && v.Name == 'alive_count' && t.Properties.Get('alive_count').Value < 1 && s_Prop.Value == 'Swarm') endMode(), Ui.GetContext().Hint.Value = 'все зомби убиты!';
});
// когда игроку поступает предложение вступить в команду
Teams.OnRequestJoinTeam.Add(function(p) { 
  // ограничитель
  if (s_Locker.Value != true || s_Prop.Value == 'Boss') {
       // добавляем игрока в команду выживших
       h.Add(p);
  }
  else { z.Add(p); } 
}); 
// спавн игрока когда он меняет команду
Teams.OnPlayerChangeTeam.Add(function(p) { p.Spawns.Spawn(); if (Players.Count >= need && s_Prop.Value == 'Waiting') { extraTime(), msg.Show('<b>Приятной игры!</b>', '<b>вам пришло сообщение:</b>'); }});
// когда игрок получает урон
Damage.OnDamage.Add(function(p, d, dm) {
  while (d.Properties.Get('M').Value >= 100) return d.Properties.Get('M').Value = 100;   
  if (s_Locker.Value != true || s_Prop.Value == 'Swarm' || s_Prop.Value == 'Boss') return; 
  d.Properties.Get('M').Value += Math.ceil(dm / 2), d.Timers.Get('Mutation').RestartLoop(4), d.Timers.Get('Reset').Restart(2);      
  d.Ui.Hint.Value = 'старайся не получать урон!';
});
// смерть игрока
Damage.OnDeath.Add(function (p) {
  if (s_Locker.Value == true && s_Prop.Value != 'Swarm' && s_Prop.Value != 'Boss') z.Add(p); 
});
// когда игрок спавнится
Spawns.OnSpawn.Add(function(p) {
  p.Properties.Immortality.Value = true
  p.Timers.Get('im').Restart(4), p_Count();
  if (p.Properties.Get('Rid').Value == null) p.Properties.Get('Rid').Value = p.IdInRoom;
  if (p.Team == h) p.Properties.Get('M').Value = 0;
  if (p.Team == z && p.Properties.Get('M').Value != 100) p.Properties.Get('M').Value = 100; 
});
// функции

// бан игроков
function ban_P(p) 
{ p.Spawns.Enable = false;
  p.Spawns.Despawn(); 
  if (h.Count < z.Count) { h.Add(p); } else if (h.Count > z.Count) { z.Add(p); } 
  banned_id.Value += p.id;
} 
// функция рандома
function m_Random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}
// функция вывода значений вверху
function props_T(t1, t2, p) {
  Ui.GetContext().TeamProp1.Value = { Team: t1, Prop: p };
  Ui.GetContext().TeamProp2.Value = { Team: t2, Prop: p };
}
// заражение рандомного игрока
function infect_P() 
{ var arr = [], e = h.GetEnumerator(); 
        while (e.MoveNext())
       { arr.push(e.Current.IdInRoom); }     
         // выбор рандмного румайдишника из массива               	
         p = Players.GetByRoomId(arr[m_Random(0, arr.length - 1)]), z.Add(p);
} 
function clear_A() {
 var e = Players.GetEnumerator(); 
        while (e.MoveNext()) 
       { h.Add(e.Current); }   	  
}
// спавн команд
function SpawnTeams() 
{ var e = Teams.GetEnumerator();
         while (e.MoveNext()) 
        { e.Current.Spawns.Spawn(); }
}
// обновление количества 
function p_Count() { if (s_Locker.Value == true) [h, z].forEach(function(e) { e.Properties.Get('count_hint').Value = e.Count, e.Properties.Get('alive_count').Value = e.GetAlivePlayersCount()}), props_T('human', 'zombie', 'count_hint'); }
c_Timer.OnTimer.Add(p_Count), c_Timer.RestartLoop(1);
// настраиваем таймеры игрока
Timers.OnPlayerTimer.Add(function(t) {
// нужное
var i = t.Id, p = t.Player;
      switch (i) {
         // вырубаем неуязвимость
	    case 'im': p.Properties.Immortality.Value = false; break;
	    // мутация игрока
        case 'Mutation': if (p.Team != z && s_Locker.Value != false) p.Properties.Get('M').Value += 1; break;                             
        // очистка подсказок
        case 'Reset': p.Ui.Hint.Reset(); break; 
    }
}); 
// лидерборд игроков 
LeaderBoard.PlayerLeaderBoardValues = [{ Value: 'Kills', DisplayName: 'ᴋ'}, { Value: 'Deaths', DisplayName: 'ᴅ' }, { Value: 'Scores', DisplayName: 'ᴏ' }, { Value: 'Rid', DisplayName: 'ɪ' }, { Value: 'Visual', DisplayName: '☣' }];
// состояния игры
waitingMode();
function waitingMode() {
    s_Prop.Value = 'Waiting';
    s_Locker.Value = false; 
    Ui.GetContext().Hint.Value = 'ожидание, нужно ещё: ' + (need - Players.Count) + ' игроков';
    Ui.GetContext().MainTimerId.Value = null;  
    props_T(null, null, null);       
    m_Timer.Restart(1);
} 
// волны
waves.Value = 1;
function extraTime() {
    s_Prop.Value = 'Extra';
    s_Locker.Value = false;  
    Ui.GetContext().Hint.Value = 'осторожно, надвигается ' + waves.Value + ' волна!';    
    Ui.GetContext().MainTimerId.Value = m_Timer.Id;
    Spawns.GetContext().RespawnTime.Value = 0;
    Damage.GetContext().DamageIn.Value = true;    
    props_T(null, null, null);          
    m_Timer.Restart(10);
    SpawnTeams();
} 
function prepareMode() {
    s_Prop.Value = 'Prepare';
    Ui.GetContext().Hint.Reset(); 
    //inventory(hTeam.Inventory, ['Main', 'Secondary', 'SecondaryInfinity', 'Melee', 'Explosive'], true);
    m_Timer.Restart(10);         
} 
function countDown() {
	s_Prop.Value = 'CountDown';
    Ui.GetContext().Hint.Value = --c.Value;
    m_Timer.Restart(1);         
}
function infectionMode() {
	s_Prop.Value = 'Infection';
    Ui.GetContext().Hint.Value = 'режим: обычная инфекция!';
    if (GameMode.Parameters.GetBool('ZombieHasGob')) {
    //inventory(zTeam.Inventory, ['Melee', 'Explosive'], true);
  } else 
    r2 = m_Random(1, 7);   
    if (r2 == 7) {
    //inventory(zTeam.Inventory, ['Melee', 'Explosive'], true);
  }
    else {
   // inventory(zTeam.Inventory, ['Melee'], true);
  }
    zm_h.Value = 290;
    infect_P();
    m_Timer.Restart(405);          
}
function swarmMode() {
	s_Prop.Value = 'Swarm';
    Ui.GetContext().Hint.Value = 'режим: массовая инфекция!';
    zm_h.Value = 520;
    TeamsBalancer.BalanceTeams();
    //inventory(zTeam.Inventory, ['Melee', 'Explosive'], true);
    Spawns.GetContext().RespawnEnable = false;
    m_Timer.Restart(10);          
}
function bossMode() {
	s_Prop.Value = 'Boss';
    Ui.GetContext().Hint.Value = 'режим: босс!';
    //inventory(zTeam.Inventory, ['Melee', 'Explosive', 'ExplosiveInfinity'], true);
    zm_h.Value = 4000;        
    infect_P();
    Spawns.GetContext().RespawnEnable = false;
    m_Timer.Restart(10);          
}
function endMode() {
	s_Prop.Value = 'End';
	e = Teams.GetEnumerator();
	while (e.MoveNext()) { 
	     // очищаем инвентарь всем
	     // inventory(e.Current.Inventory, [], true);
    }  
    Spawns.GetContext().RespawnEnable = true;
    Damage.GetContext().DamageIn.Value = false;
    m_Timer.Restart(15);          
    waves.Value++;
}
r = m_Random(1, 5);   
function r_Mode() {
   // рандомный выбор  
   if (r == 5 && Players.Count >= 18 && waves.Value >= 4) bossMode();
   if (r == 4 && Players.Count >= 10 && waves.Value >= 2) swarmMode();
   else swarmMode(); 
}
// основной таймер
m_Timer.OnTimer.Add(function() {
      // смена состояний
      switch (s_Prop.Value) {
		   case 'Waiting': if (Players.Count < need) { waitingMode(); } else { Ui.GetContext().Hint.Value = 'все игроки для игры набраны!'; }; break;
		   // подготовка
	       case 'Extra': prepareMode(), Ui.GetContext().MainTimerId.Value = null; break;           
	       case 'Prepare': c.Value = 11, countDown(); break;
	       case 'CountDown': if (c.Value != 1) { countDown(); } else { r_Mode(), s_Locker.Value = true, Ui.GetContext().MainTimerId.Value = m_Timer.Id, Spawns.GetContext().RespawnTime.Value = 6; }; break;           
	       case 'Infection': case 'Swarm': case 'Boss': endMode(), Ui.GetContext().Hint.Value = 'люди пережили эту волну!'; break;          
	       case 'End': extraTime(), clear_A(); break;           
      }
});
// зоны
var view = AreaViewService.GetContext().Get('v');
view.Tags = ['ban', 'msg'];
view.Color = { r: 1, g: 1, b: 1 };
view.Enable = true;
var banTrigger = AreaPlayerTriggerService.Get('b');
banTrigger.Tags = ['ban'];
banTrigger.Enable = true;
banTrigger.OnEnter.Add(function(pl, a) {
   // бан игрока
   arr = a.Name.split('/'), p = Players.GetByRoomId(arr[0]); ban_P(p), p.Ui.Hint.Value = 'ты забанен. причина: ' + arr[1], pl.Ui.Hint.Value = p + ' успешно забанен. причина: ' + arr[1]; a.Ranges.Clear(), a.Tags.Clear();
}); 
msgTroollolo = AreaPlayerTriggerService.Get('m');
msgTroollolo.Tags = ['msg'];
msgTroollolo.Enable = true;
msgTroollolo.OnEnter.Add(function(p, a) {
   // вывод сообщения на экран
   msg.Show('<b>' + a.Name + '</b>', '<b>вам пришло сообщение:</b>');
}); 