import { Grid } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

interface OneColumnProps{
  // If any, enter additional props that only exist on this component
  children: any[]
}

const useStyles = makeStyles((/* theme */) => ({
  colStyles: {
    display: "grid",
    gap: "1rem",
    alignContent: "baseline",
  },
}));


export default function OneColumn(props: OneColumnProps) {
  const classes = useStyles();

  const { children} = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} className={classes.colStyles}>
        {children.map(child => { return child; } )}
      </Grid>
    </Grid>
  )
}


