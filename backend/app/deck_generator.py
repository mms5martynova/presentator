from typing import Any

from app.schemas import DeckSlideInput, SlideSpec, TaskCreate

LAYOUT_BY_TYPE = {
    "title_slide": "title_slide",
    "bar_chart": "chart_full",
    "comparison_table": "comparison_table",
    "text_block": "text_block",
    "process": "process_diagram",
}


def layout_for(slide_type: str) -> str:
    try:
        return LAYOUT_BY_TYPE[slide_type]
    except KeyError as exc:
        raise ValueError(f"Неподдерживаемый тип слайда: {slide_type}") from exc


def to_task_create(
    title: str,
    slides: list[DeckSlideInput],
    style_code: str | None,
    options: Any,
    correlation_id: str | None,
    mode: str = "async",
) -> TaskCreate:
    template_id = None
    if style_code and style_code.startswith("template:"):
        template_id = int(style_code.removeprefix("template:"))

    return TaskCreate(
        title=title,
        slides=[to_slide_spec(slide) for slide in slides],
        slides_count=len(slides),
        template_id=template_id,
        style_code=style_code,
        options=options,
        correlation_id=correlation_id,
        want_pdf=True,
        mode=mode,
    )


def to_slide_spec(slide: DeckSlideInput) -> SlideSpec:
    layout_for(slide.type)
    data = slide.data
    title = str(data.get("title") or "Слайд")

    if slide.type == "title_slide":
        subtitle = data.get("subtitle")
        bullets = [str(subtitle)] if subtitle else []
        return SlideSpec(type="text", title=title, bullets=bullets)

    if slide.type == "bar_chart":
        categories = [str(item) for item in data.get("categories", [])]
        values = data.get("values", [])
        series_names = data.get("series_names", [])
        if not categories or not values:
            raise ValueError("Для bar_chart нужны categories и values")
        if any(len(series) != len(categories) for series in values):
            raise ValueError("Количество значений графика должно совпадать с количеством категорий")
        series = [
            {"name": str(series_names[index]) if index < len(series_names) else f"Ряд {index + 1}", "values": values[index]}
            for index in range(len(values))
        ]
        return SlideSpec(
            type="chart",
            title=title,
            chart={"kind": "column", "categories": categories, "series": series},
        )

    if slide.type == "comparison_table":
        return SlideSpec(
            type="table",
            title=title,
            table={"headers": data.get("header", []), "rows": data.get("rows", [])},
        )

    content = str(data.get("content", ""))
    bullets = [line.strip() for line in content.splitlines() if line.strip()]
    if slide.type == "process":
        bullets = [f"{index}. {line}" for index, line in enumerate(bullets, start=1)]
    footer = data.get("footer")
    if footer:
        bullets.append(f"{footer}")
    return SlideSpec(type="text", title=title, bullets=bullets)
