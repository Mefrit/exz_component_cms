<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once CMS_PATH . '/define.php';
require_once __DIR__ . '/../../application/library/controller/componentownfields.php';

class Component_CalendarNews extends Controller_ComponentOwnField {
    Private $message;
    public function getPath() {
        return Path::normalize(Path::join(CMS_PATH, '..', '..', 'system', 'sites'));
    }
    public function requestDecode(/*.ComponentRequest.*/$request) {
        $result = [];
        $result["id_section"] = (int)$request->get('section_id');
        $result["documents_on_page"] = (int)$request->get('documents_on_page');
        $result["page"] = (int)$request->get('page');
        $result["only_keywords"] = (int)$request->get('only_keywords');
        if($result["id_section"]==0/*||$result["documents_on_page"]==0*/) return null;
        if($request->get("keywords")) {
            $result["keywords"] = explode(",",$request->get("keywords"));
        } else {
            $result["keywords"] = null;
        }
        return $result;
    }
    public function getComponentInfo ($data){
        $result = new stdClass();
        $result->list = [];
        $result->width_image = 320; 
        if(isset($data["color"])){
            $result->list[] = "Цвет: ".$data["color"];
        }
        if(isset($data["page_id"])){
            $page = $this->db->executeQuery("SELECT subtitle FROM resources WHERE id_resource = {$data['page_id']}");
            foreach($page as $title) {
                $result->list[] = "Новости выложены на : ".$title["subtitle"];
            }
        }
         if(isset($data["id_news_list"])){
            $block = $this->db->executeQuery("SELECT title FROM iblock WHERE id_iblock= {$data['id_news_list']}");
            foreach($block as $title) {
                $result->list[] = "Название коллекции новостей: ".$title["title"];
            }
        }
     
        return $result;
    }
    public function getPathParent ($id_parent) {
        $path_parent_section = "";
        $section = iterator_to_array($this->db->executeQuery("SELECT path, id_parent FROM sections WHERE id_section = ".$id_parent))[0];
        if($section["id_parent"]){
            $path_parent_section .= $this->getPathParent($section["id_parent"]);
        }
        if($section["path"] != "/")
            $path_parent_section .=  $section["path"];
       
        return $path_parent_section;
    }
    public function actionIndex(/*.ComponentRequest.*/ $request) {
       
        $params = $this->parameter; 
        $path_parent_section = "/";
        $tpl = $this->getView('index.html');
        $month = (int)$request->get('month');
        if(null ==   $month || $month > 12 || $month < 0){
            $month = (int)date("n");
        }
        $form = new StdClass();
        $path2script = $this->getTemplateWebPath();
        $path2script = $path2script . "/js/";
        Controller_Site::addRequireJsPath('calendarnews',$path2script );
        $time_start_month = mktime(0, 0, 0,  $month, 0, (int)date("y"));
        $time_end_month = mktime(0, 0, 0,  $month + 1, 0, (int)date("y"));
        $page = iterator_to_array($this->db->executeQuery("SELECT name,id_section FROM resources WHERE id_resource = ".$params["page_id"]))[0];

        $path_parent_section = $this->getPathParent($page["id_section"]);
        $tpl->id_news_list = $params["id_news_list"];
        $tpl->path2page = $path_parent_section . "/".$page["name"];
        $tpl->background_color = $params["color"];

        $tpl->form = $form;
        // возвращает модули
        return $tpl->execute();
        
        
    }
     
    public function getDateMonth($month, $year,$id_news_list){
        $res = new StdClass();
        $time_start_month = mktime(0, 0, 0,  $month + 1, 0,  $year) -100;
        $time_end_month = mktime(0, 0, 0,  $month + 2, 0,  $year) +100;
        $days_events = [];
        $params = $this->parameter; 
        $news = iterator_to_array($this->db->executeQuery("SELECT * FROM iblock_item  WHERE time_begin > $time_start_month AND time_begin <  $time_end_month AND id_iblock = $id_news_list "));
     
        $res = [];
        foreach($news as $elem ){
            $date = getdate($elem["time_begin"]);
            $res ["mday"] = $date ["mday"];
            $res ["title"] = $elem ["title"];
            $res ["id_iblock_item"] = $elem ["id_iblock_item"];
            $days_events[] = $res;
        }
        return $days_events;

    }
    public function actionDate(/*.ComponentRequest.*/ $request) {
        $result = ['state'=>'ok'];
        $result["message"] = "Date";
  
        $month = (int)$request->get("month");
        $year = (int)$request->get("year");
        $id_news_list = (int)$request->get("id_news_list");
        if($month < 0 ){
            $year = $year - 1;
            $month = 11;
        }
        if($month > 11){
            $year = $year + 1;
            $month = 0;
        }
        $result["current_month"] = $month ;
        $result["current_year"] = $year;
        
        $result["news_days"] = $this->getDateMonth($month, $year,$id_news_list);
        return $result;
    }
}
