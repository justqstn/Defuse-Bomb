import * as API from 'pixel_combats/room';
/*
Генерация случайной строки
*/

export function RandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

/*
Функция создания команды
string tag - id/тег команды 
object name - имя команды. 
поля объекта: 
  string name (название), 
  string undername (текст под названием команды),
  bool isPretty (нужно ли красивое название)
{name: "Синие", undername: "Модуль от just_qstn", isPretty: true}
number/Index - спавнпоинт. необязательный параметр

ex: CreateTeam("1", {name: "Текст сверху", undername: "текст снизу", isPretty: true}, new Color(1, 0, 0, 0));
*/
export function CreateTeam(tag, name, color, spawnpoint) {
    if (name.isPretty) {
        API.Teams.Add(tag, `<i><B><size=36>${name.name[0]}</size><size=27>${name.name.slice(1)}</size></B>\n${name.undername}</i>`, color);
    }
    else {
        API.Teams.Add(tag, name.name, color);
    }

    let team = API.Teams.Get(tag);
    if (spawnpoint) team.Spawns.SpawnPointsGroups.Add(spawnpoint);
    return team;
}

/*
Функция создания зоны
object params - параметры зоны
поля объекта:
  string name: id зоны
  string[] tags: массив тегов
  Color color: цвет зоны
  bool view: включен ли визуализатор. по умолчанию true
  bool trigger: включен ли триггер. по умолчанию true 
  function enter: функция, выполняющаяся при входе в зону
  functiom exit: функция, выполняющаяся при выходе из зоны
ex: CreateArea({name: "ex", tags: ["tag"], color: new Color(1, 1, 1, 0), enter: function(player, area) { player.Ui.Hint.Value = "вы вошли в зону"; } });
*/

export function CreateArea(params) {
    let t = API.AreaPlayerTriggerService.Get(params.name), v = API.AreaViewService.GetContext().Get(params.name);
    v.Tags = params.tags;
    t.Tags = params.tags;
    v.Color = params.color;
    v.Enable = params.view || true;
    t.Enable = params.trigger || true;
    if (params.enter) t.OnEnter.Add(params.enter);
    if (params.exit) t.OnExit.Add(params.exit);
    return { Trigger: t, View: t };
}

/*
pcall - бертка для try catch
Вернет 0 если нет ошибок, вернет 1 если есть
Чтобы вам показало ошибку пишите параметр log true
ex: pcall(function() { Basic.Msg.Show("Вызвано через защищенный вызов");});
*/

export function pcall(func, log = true) {
    try {
        func();
    }
    catch (e) {
        if (log) API.room.PopUp(`Error!\nName: ${e.name}\nDescription:${e.message}\nStack:${e.stack}`);
        return 1;
    }
    return 0;
}

/*
Выполнение кода с задержкой
Использовать аккуратно, может быть многозатратной операцией
*/
export function SetTimeout(callback, interval)
{
    const timer = API.Timers.GetContext().Get(RandomString(6));

    function _timer()
    {
        callback();
        
        timer.Remove(_timer);
    }
    timer.OnTimer.Add(_timer);
    timer.Restart(interval);
}


/*
Создание бесконечного таймера с любой задержкой.
Внимание, включается через одну секунду!
Если интервал меньше единицы, то желательно делать его кратным двойке (потому что я так сказал), а также
не делать тысячные и так далее разряды.
Работает сразу после создания.
*/

export function JQTimer(callback, interval)
{
    const timer = API.Timers.GetContext().Get(RandomString(6));
    if (interval < 1) {
        for (let i = 1 / interval; i-=1;)
        {
            timer.OnTimer.Add(callback);
            timer.RestartLoop(i + interval);
        }
    } 
    else {
        timer.OnTimer.Add(callback);
        timer.RestartLoop(interval);
    }
}
