import Grid, {
  GridOptions,
  PROPERTY_TYPE,
  Properties,
  GetterSetter,
  GridItem,
} from "../../../src/index";

export interface SampleGridOptions extends GridOptions {
  renderProperty?: number;
  property?: string;
}

@GetterSetter
export class SampleGrid extends Grid<SampleGridOptions> {
  public static propertyTypes = {
    ...Grid.propertyTypes,
    renderProperty: PROPERTY_TYPE.RENDER_PROPERTY,
    property: PROPERTY_TYPE.PROPERTY,
  };
  public static defaultOptions: Required<SampleGridOptions> = {
    ...Grid.defaultOptions,
    renderProperty: -1,
    property: "property1",
  };

  public applyGrid(items: GridItem[], direction: "start" | "end", outline: number[]) {
    const startOutline = outline.length ? [...outline] : [0];
    let prevOutline = [...startOutline];

    if (direction === "end") {
      items.forEach((item) => {
        const prevPos = prevOutline[0] || 0;
        const rect = item.rect;


        item.setCSSGridRect({
          contentPos: prevPos,
        });

        prevOutline = [prevPos + (rect?.height ?? 0)];
      });
    }
    return {
      start: startOutline,
      end: prevOutline,
    };
  }
}

export interface SampleGrid extends Properties<typeof SampleGrid> {}
